// @generated from adl module adlc.config.rust

use serde::Deserialize;
use serde::Serialize;

/**
 * ADL module or declaration annotation to control
 * whether code is actually generated.
 */
pub type RustGenerate = bool;

/**
 * ADL field annotation giving explicit control over
 * how a field should be stored.
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum RustStorageModel {
  /**
   * Standard inline storage
   */
  #[serde(rename="standard")]
  Standard,

  /**
   * Store the value in a Box<>
   */
  #[serde(rename="boxed")]
  Boxed,
}

/**
 * ADL declaration annotation to specify that a custom type
 * should be used
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RustCustomType {
  pub rustname: String,

  pub helpers: String,

  #[serde(default="RustCustomType::def_generate_orig_adl_type")]
  #[serde(rename="generateOrigADLType")]
  pub generate_orig_adl_type: String,

  #[serde(rename="stdTraits")]
  pub std_traits: Vec<String>,
}

impl RustCustomType {
  pub fn new(rustname: String, helpers: String, std_traits: Vec<String>) -> RustCustomType {
    RustCustomType {
      rustname: rustname,
      helpers: helpers,
      generate_orig_adl_type: RustCustomType::def_generate_orig_adl_type(),
      std_traits: std_traits,
    }
  }

  pub fn def_generate_orig_adl_type() -> String {
    "".to_string()
  }
}

/**
 * ADL declaration annotation requesting extra traits on the
 * generated type's derive attribute.
 * The names are emitted verbatim, so they may be qualified
 * paths, eg "my_crate::MyDerive". Names that are already being
 * derived are ignored, as are `Serialize` and `Deserialize` on
 * a newtype, where those impls are hand written.
 * Has no effect on a type alias, which has no derive attribute.
 */
pub type RustExtraDeriveTraits = Vec<String>;

/**
 * Marks an annotation declaration as one whose uses are carried through
 * into the generated rust code.
 * Apply it to the declaration of another annotation, once, eg
 *     annotation MyAnnotation RustEmitAnnotation null;
 * or, inline on the declaration, `@RustEmitAnnotation`. The side file form
 * needs the explicit `null`, as it has no syntax for a Void value.
 * Thereafter every use of MyAnnotation on a struct, union or newtype
 * declaration, on a struct field, or on a union branch is emitted beside
 * the generated item as
 *     #[adl_annotation(name="my.module.MyAnnotation", value="<json>")]
 * where <json> is the annotation's value in ADL's json encoding. The value
 * is passed through uninterpreted, so this works for an annotation of any
 * type. Rust proc macros can then read the annotation at compile time.
 * Rust requires such an attribute to be introduced by a derive macro on the
 * same item, so `adl_rt::AdlAnnotations` is added to the item's derive
 * attribute automatically wherever an annotation is emitted. The `adl_rt`
 * crate, which re-exports that derive from `adl_rt_derive`, must therefore
 * be a dependency of the generated code.
 * Has no effect on a type alias, which has no derive attribute and so
 * cannot introduce the required attribute.
 */
pub type RustEmitAnnotation = ();
