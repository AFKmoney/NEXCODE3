#![deny(unsafe_op_in_unsafe_fn, missing_docs)]
//! Nexus Parser Module
//! Incremental parsing powered by tree-sitter for multiple target languages.

use std::sync::Mutex;
use thiserror::Error;
use tree_sitter::{InputEdit, Language, Parser, Point, Tree};

/// Supported languages by Nexus IDE.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SupportedLanguage {
    /// Rust support
    Rust,
    /// TypeScript support
    TypeScript,
    /// Python support
    Python,
}

impl SupportedLanguage {
    /// Returns the tree-sitter Language struct for the given supported language.
    pub fn get_language(&self) -> Language {
        match self {
            Self::Rust => tree_sitter_rust::language(),
            Self::TypeScript => tree_sitter_typescript::language_typescript(),
            Self::Python => tree_sitter_python::language(),
        }
    }
}

/// Errors that can occur during parsing operations.
#[derive(Debug, Error)]
pub enum ParserError {
    /// Failed to initialize language
    #[error("Failed to initialize the parser with the given language.")]
    InitializationFailed,
    /// Failed to output syntax tree
    #[error("Failed to parse the text into a syntax tree.")]
    ParseFailed,
    /// Internal lock poisoned
    #[error("Thread lock poisoned.")]
    LockPoisoned,
}

/// The core parsing engine that maintains state for incremental parsing.
pub struct NexusParser {
    parser: Mutex<Parser>,
    /// The currently loaded language
    pub lang: SupportedLanguage,
}

impl Default for NexusParser {
    fn default() -> Self {
        Self::new(SupportedLanguage::Rust).unwrap()
    }
}

impl NexusParser {
    /// Creates a new NexusParser for the target language.
    pub fn new(lang: SupportedLanguage) -> Result<Self, ParserError> {
        let mut parser = Parser::new();
        parser
            .set_language(&lang.get_language())
            .map_err(|_| ParserError::InitializationFailed)?;

        Ok(Self {
            parser: Mutex::new(parser),
            lang,
        })
    }

    /// Parses a complete source text from scratch.
    pub fn parse(&self, text: &str) -> Result<Tree, ParserError> {
        let mut parser = self.parser.lock().map_err(|_| ParserError::LockPoisoned)?;
        parser
            .parse(text, None)
            .ok_or(ParserError::ParseFailed)
    }

    /// Incrementally updates an existing syntax tree with a textual edit.
    pub fn update(
        &self,
        old_tree: &mut Tree,
        text: &str,
        edit: &InputEdit,
    ) -> Result<Tree, ParserError> {
        old_tree.edit(edit);
        let mut parser = self.parser.lock().map_err(|_| ParserError::LockPoisoned)?;
        parser
            .parse(text, Some(old_tree))
            .ok_or(ParserError::ParseFailed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_rust() {
        let parser = NexusParser::new(SupportedLanguage::Rust).unwrap();
        let code = "fn main() { println!(\"Hello, world!\"); }";
        let tree = parser.parse(code).unwrap();
        assert_eq!(tree.root_node().kind(), "source_file");
    }

    #[test]
    fn test_incremental_update() {
        let parser = NexusParser::new(SupportedLanguage::Rust).unwrap();
        let mut code = String::from("fn main() { }");
        let mut tree = parser.parse(&code).unwrap();
        
        let edit = InputEdit {
            start_byte: 12,
            old_end_byte: 12,
            new_end_byte: 22,
            start_position: Point::new(0, 12),
            old_end_position: Point::new(0, 12),
            new_end_position: Point::new(0, 22),
        };
        code.insert_str(12, "let x = 5;");
        let new_tree = parser.update(&mut tree, &code, &edit).unwrap();
        assert_eq!(new_tree.root_node().kind(), "source_file");
    }
}
