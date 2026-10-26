#![allow(clippy::all)]

// Lets paths of the form `::adl::...` resolve inside this crate, so generated
// code can name the runtime the same way whether it lives here or downstream.
extern crate self as adl;

// Hand written, unlike the `gen` tree below.
pub mod api;

// Re-exported so generated code and downstream users name a single crate.
// A proc macro has to live in its own crate (see derive/), but that is an
// implementation detail rather than part of the interface.
pub use adl_derive::HttpApi;

#[rustfmt::skip]
#[allow(dead_code)]
pub mod gen;

#[rustfmt::skip]
#[allow(dead_code)]
pub mod rt;

#[rustfmt::skip]
pub mod custom;
#[rustfmt::skip]
pub mod db;
