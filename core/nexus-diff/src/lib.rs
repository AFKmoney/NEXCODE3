#![deny(unsafe_op_in_unsafe_fn, missing_docs)]
//! Nexus Diff Engine
//! High-performance textual differencing using Myers + Histogram algorithms.

use similar::{ChangeTag, TextDiff};
use thiserror::Error;

/// Diffing errors.
#[derive(Debug, Error)]
pub enum DiffError {
    /// Failed to compute diff
    #[error("Failed to compute text diff.")]
    ComputeError,
}

/// A parsed change in the document.
#[derive(Debug, PartialEq, Eq, Clone)]
pub struct DiffOp {
    /// Tag indicating "insert", "delete", or "equal"
    pub kind: String,
    /// The actual text segment
    pub content: String,
}

/// Computes a standard textual diff between two source strings.
pub fn text_diff(old: &str, new: &str) -> Vec<DiffOp> {
    let diff = TextDiff::from_lines(old, new);
    diff.iter_all_changes()
        .map(|change| {
            let kind = match change.tag() {
                ChangeTag::Delete => "delete".to_string(),
                ChangeTag::Insert => "insert".to_string(),
                ChangeTag::Equal => "equal".to_string(),
            };
            DiffOp {
                kind,
                content: change.value().to_string(),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_textual_diff() {
        let old = "fn main() {\n    println!(\"Hello\");\n}\n";
        let new = "fn main() {\n    println!(\"Hello World\");\n}\n";
        let ops = text_diff(old, new);
        
        assert_eq!(ops[0].kind, "equal");
        assert_eq!(ops[1].kind, "delete");
        assert_eq!(ops[2].kind, "insert");
        assert_eq!(ops[3].kind, "equal");
    }
}
