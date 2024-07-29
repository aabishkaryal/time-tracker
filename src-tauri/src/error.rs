use rusqlite::Error as RusqliteError;
use std::fmt;

#[derive(Debug)]
pub enum DatabaseError {
    VersionNotSupported(i32),
    RusqliteError(RusqliteError),
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            DatabaseError::VersionNotSupported(version) => {
                write!(f, "Database version {} not supported", version)
            }
            DatabaseError::RusqliteError(ref err) => err.fmt(f),
        }
    }
}

impl std::error::Error for DatabaseError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match *self {
            DatabaseError::VersionNotSupported(_) => None,
            DatabaseError::RusqliteError(ref err) => Some(err),
        }
    }
}

impl From<RusqliteError> for DatabaseError {
    fn from(err: RusqliteError) -> DatabaseError {
        DatabaseError::RusqliteError(err)
    }
}
