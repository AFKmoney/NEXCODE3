#![deny(unsafe_op_in_unsafe_fn, missing_docs)]
//! Nexus Git Engine
//! Provides high-level abstractions over git2 for IDE operations.

use git2::{
    AutotagOption, BranchType, Commit, Cred, FetchOptions, ObjectType, Oid, PushOptions,
    RemoteCallbacks, Repository, Signature,
};
use std::path::Path;
use thiserror::Error;

/// Errors returned by the Git Engine
#[derive(Debug, Error)]
pub enum GitError {
    /// Internal git2 error
    #[error("Git engine error: {0}")]
    Git2(#[from] git2::Error),
    /// No commit found (e.g., empty repo)
    #[error("No commits found")]
    NoCommitFound,
    /// Remote operation failed
    #[error("Remote operation failed: {0}")]
    RemoteError(String),
}

/// Core wrapper around a local Git repository
pub struct GitManager {
    repo: Repository,
}

impl GitManager {
    /// Opens an existing repository at the given path
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self, GitError> {
        let repo = Repository::open(path)?;
        Ok(Self { repo })
    }

    /// Clones a remote repository to a local path
    pub fn clone_repo(url: &str, path: &Path) -> Result<Self, GitError> {
        let repo = Repository::clone(url, path)?;
        Ok(Self { repo })
    }

    /// Stages all modified/untracked files and creates a commit
    pub fn commit_all(
        &self,
        message: &str,
        author_name: &str,
        author_email: &str,
    ) -> Result<Oid, GitError> {
        let mut index = self.repo.index()?;
        index.add_all(["*"].iter(), git2::IndexAddOption::DEFAULT, None)?;
        index.write()?;
        
        let oid = index.write_tree()?;
        let signature = Signature::now(author_name, author_email)?;
        let tree = self.repo.find_tree(oid)?;

        match self.get_last_commit() {
            Ok(parent_commit) => {
                let commit_id = self.repo.commit(
                    Some("HEAD"),
                    &signature,
                    &signature,
                    message,
                    &tree,
                    &[&parent_commit],
                )?;
                Ok(commit_id)
            }
            Err(_) => {
                // Initial commit
                let commit_id = self.repo.commit(
                    Some("HEAD"),
                    &signature,
                    &signature,
                    message,
                    &tree,
                    &[],
                )?;
                Ok(commit_id)
            }
        }
    }

    /// Retrieves the commit object for HEAD
    fn get_last_commit(&self) -> Result<Commit, GitError> {
        let obj = self.repo.head()?.resolve()?.peel(ObjectType::Commit)?;
        obj.into_commit()
            .map_err(|_| GitError::NoCommitFound)
    }

    /// Creates a new branch pointing to HEAD
    pub fn create_branch(&self, branch_name: &str) -> Result<(), GitError> {
        let commit = self.get_last_commit()?;
        self.repo.branch(branch_name, &commit, false)?;
        Ok(())
    }

    /// Lists all local branches
    pub fn list_branches(&self) -> Result<Vec<String>, GitError> {
        let branches = self.repo.branches(Some(BranchType::Local))?;
        let mut branch_names = Vec::new();
        for branch in branches {
            let (br, _) = branch?;
            if let Some(name) = br.name()? {
                branch_names.push(name.to_string());
            }
        }
        Ok(branch_names)
    }

    /// Switches to the target branch
    pub fn checkout_branch(&self, branch_name: &str) -> Result<(), GitError> {
        let (object, reference) = self.repo.revparse_ext(branch_name)?;
        self.repo.checkout_tree(&object, None)?;
        if let Some(gref) = reference {
            self.repo.set_head(gref.name().unwrap())?;
        } else {
            self.repo.set_head_detached(object.id())?;
        }
        Ok(())
    }

    /// Pushes the current branch to a remote origin
    pub fn push(&self, remote_name: &str, branch_name: &str) -> Result<(), GitError> {
        let mut remote = self.repo.find_remote(remote_name)?;
        
        let mut callbacks = RemoteCallbacks::new();
        callbacks.credentials(|_url, username_from_url, _allowed_types| {
            Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
        });

        let mut push_options = PushOptions::new();
        push_options.remote_callbacks(callbacks);

        let refspec = format!("refs/heads/{}:refs/heads/{}", branch_name, branch_name);
        remote.push(&[&refspec], Some(&mut push_options))?;
        Ok(())
    }

    /// Fetches from the specified remote
    pub fn fetch(&self, remote_name: &str) -> Result<(), GitError> {
        let mut remote = self.repo.find_remote(remote_name)?;
        let mut callbacks = RemoteCallbacks::new();
        callbacks.credentials(|_url, username_from_url, _allowed_types| {
            Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
        });

        let mut fetch_options = FetchOptions::new();
        fetch_options.remote_callbacks(callbacks);

        remote.fetch(
            &["master", "main"],
            Some(&mut fetch_options),
            None,
        )?;
        Ok(())
    }
}
