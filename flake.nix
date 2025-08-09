{
  description = "cr-sqlite JavaScript/TypeScript monorepo development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Node.js version that meets the >= 19 requirement
        nodejs = pkgs.nodejs_22;
        
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # JavaScript/TypeScript toolchain
            nodejs
            bun
            
            # Build tools for WASM
            emscripten
            cmake
            python3
            
            # Rust toolchain for building from source
            rustup
            
            # SQLite for testing
            sqlite
            
            # Git for submodules
            git
            
            # Common development tools
            jq
            ripgrep
            gnumake
            
            # For Cypress browser tests
            xvfb-run
            chromium
            
            # Platform-specific build tools
            pkg-config
          ] ++ lib.optionals stdenv.isDarwin [
            # macOS specific tools
            darwin.apple_sdk.frameworks.CoreServices
            darwin.apple_sdk.frameworks.Security
          ] ++ lib.optionals stdenv.isLinux [
            # Linux specific tools for Cypress
            gtk3
            nss
            nspr
            alsa-lib
            libdrm
            mesa
          ];

          shellHook = ''
            echo "🚀 cr-sqlite-js development environment"
            echo ""
            echo "Available tools:"
            echo "  • Node.js: $(node --version)"
            echo "  • Bun: $(bun --version)"
            echo "  • Rust: rustup (use 'rustup default nightly' for nightly toolchain)"
            echo "  • SQLite: $(sqlite3 --version | head -n1)"
            echo ""
            echo "Quick start:"
            echo "  1. Initialize submodules: git submodule update --init --recursive"
            echo "  2. Setup Rust nightly: rustup default nightly"
            echo "  3. Build everything: make"
            echo "  4. Run tests: ./test.sh"
            echo ""
            
            # Set up Rust nightly if not already configured
            if ! rustup show | grep -q "nightly"; then
              echo "📦 Setting up Rust nightly toolchain..."
              rustup default nightly
            fi
            
            # Create local bin directory for project scripts
            export PATH="$PWD/node_modules/.bin:$PATH"
            
            # Set NODE_OPTIONS for better memory management in large builds
            export NODE_OPTIONS="--max-old-space-size=4096"
            
            # Cypress browser configuration
            export CYPRESS_INSTALL_BINARY=0
            export CYPRESS_RUN_BINARY=${pkgs.chromium}/bin/chromium
          '';
        };
      });
}