{ pkgs, toolchainFile }:

let
  # The toolchain comes from the nix store, not from ~/.rustup.
  #
  # rustup installs toolchains into ~/.rustup and patches each one to call an
  # ld-wrapper.sh inside whichever rustup store path performed the install.
  # When nix later garbage collects that path the toolchain still looks
  # healthy - `rustc --version` answers fine - but every link fails with
  # "ld-wrapper.sh: No such file or directory", which reads like a project
  # problem and is not one. It is invisible until something needs to link, so
  # a fully cached `cargo check` keeps passing and the first new dependency
  # breaks.
  #
  # A store toolchain is immutable and self-consistent; if GC removes it, nix
  # refetches it correctly rather than leaving a half-broken one behind.
  rustToolchain = pkgs.rust-bin.fromRustupToolchainFile toolchainFile;
in
{
  buildInputs = (with pkgs; [
    clang
    llvmPackages.bintools
    openssl
    pkg-config
  ]) ++ [ rustToolchain ];

  # https://github.com/rust-lang/rust-bindgen#environment-variables
  LIBCLANG_PATH = pkgs.lib.makeLibraryPath [ pkgs.llvmPackages_latest.libclang.lib ];

  # Add precompiled libraries to the rustc search path
  RUSTFLAGS = builtins.map (a: ''-L ${a}/lib'') [
    # add libraries here (e.g. pkgs.libvmi)
  ];

  LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
    # load external libraries that you need in your rust project here
  ];

  # Add glibc, clang, glib and other headers to the bindgen search path
  BINDGEN_EXTRA_CLANG_ARGS =
    (builtins.map (a: ''-I"${a}/include"'') [
      # add dev libraries here (e.g. pkgs.libvmi.dev)
      pkgs.glibc.dev
    ])
    ++ [
      ''-I"${pkgs.llvmPackages_latest.libclang.lib}/lib/clang/${pkgs.llvmPackages_latest.libclang.version}/include"''
      ''-I"${pkgs.glib.dev}/include/glib-2.0"''
      ''-I${pkgs.glib.out}/lib/glib-2.0/include/''
    ];
}
