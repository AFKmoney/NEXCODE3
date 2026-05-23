#![deny(unsafe_op_in_unsafe_fn, missing_docs)]
//! Nexus TimeTravel Engine
//! Append-only event log for time-travel debugging and snapshot playback.

use redb::{Database, ReadableTable, TableDefinition};
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

const EVENTS_TABLE: TableDefinition<u64, &[u8]> = TableDefinition::new("events");

/// TimeTravel Engine Errors
#[derive(Debug, Error)]
pub enum TimeTravelError {
    /// Underlying Redb database error
    #[error("Database error: {0}")]
    Database(String),
    /// Event serialization/deserialization error
    #[error("Serialization error: {0}")]
    Serialization(#[from] bincode::Error),
}

/// An immutable event in the timeline
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Event {
    /// Logical clock tick
    pub timestamp: u64,
    /// Encoded action name
    pub action: String,
    /// Serialized payload state
    pub payload: Vec<u8>,
}

/// Append-only event log manager
pub struct EventLog {
    db: Database,
}

impl EventLog {
    /// Opens or creates the append-only event log database
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, TimeTravelError> {
        let db = Database::create(path).map_err(|e| TimeTravelError::Database(e.to_string()))?;
        let write_txn = db.begin_write().map_err(|e| TimeTravelError::Database(e.to_string()))?;
        {
            let _ = write_txn
                .open_table(EVENTS_TABLE)
                .map_err(|e| TimeTravelError::Database(e.to_string()))?;
        }
        write_txn
            .commit()
            .map_err(|e| TimeTravelError::Database(e.to_string()))?;
        Ok(Self { db })
    }

    /// Records a new event into the time-travel log
    pub fn record(&self, tick: u64, event: &Event) -> Result<(), TimeTravelError> {
        let write_txn = self.db.begin_write().map_err(|e| TimeTravelError::Database(e.to_string()))?;
        {
            let mut table = write_txn
                .open_table(EVENTS_TABLE)
                .map_err(|e| TimeTravelError::Database(e.to_string()))?;
            let serialized = bincode::serialize(event)?;
            table
                .insert(tick, serialized.as_slice())
                .map_err(|e| TimeTravelError::Database(e.to_string()))?;
        }
        write_txn
            .commit()
            .map_err(|e| TimeTravelError::Database(e.to_string()))?;
        Ok(())
    }

    /// Rewinds and retrieves an event at a specific logical tick
    pub fn rewind(&self, tick: u64) -> Result<Option<Event>, TimeTravelError> {
        let read_txn = self.db.begin_read().map_err(|e| TimeTravelError::Database(e.to_string()))?;
        let table = read_txn
            .open_table(EVENTS_TABLE)
            .map_err(|e| TimeTravelError::Database(e.to_string()))?;
        
        if let Some(entry) = table.get(tick).map_err(|e| TimeTravelError::Database(e.to_string()))? {
            let event = bincode::deserialize(entry.value())?;
            Ok(Some(event))
        } else {
            Ok(None)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_record_and_rewind() {
        let dir = tempdir().unwrap();
        let log = EventLog::new(dir.path().join("timetravel.redb")).unwrap();
        
        let event = Event {
            timestamp: 42,
            action: "INSERT_TEXT".to_string(),
            payload: vec![1, 2, 3],
        };

        log.record(42, &event).unwrap();
        
        let fetched = log.rewind(42).unwrap().unwrap();
        assert_eq!(fetched, event);
        
        let empty = log.rewind(99).unwrap();
        assert!(empty.is_none());
    }
}
