// @generated from adl module common.strings

/**
 * A string that isn't empty, and isn't only whitespace.
 */
pub type StringNE = String;

/**
 * An alphanumeric string, with hyphens for separation.
 */
pub type StringANH = String;

/**
 * A multi line, free-form text string
 */
pub type StringML = String;

/**
 * An email address
 */
pub type EmailAddress = String;

/**
 * A markdown text string
 */
pub type StringMD = String;

/**
 * A password, which cannot be empty. Other constraints
 * are application specific.
 */
pub type Password = String;
