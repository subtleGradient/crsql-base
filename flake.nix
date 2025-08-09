{
  description = "cr-sqlite JavaScript/TypeScript monorepo development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};

      # Node.js version that meets the >= 19 requirement
      nodejs = pkgs.nodejs_22;
    in {
      devShells.default = pkgs.mkShellNoCC {
        buildInputs = with pkgs;
          [
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

            # Platform-specific build tools
            pkg-config

            # for kamal
            ruby_3_3
          ]
          ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [
            # iOS development tools
            cocoapods
          ]
          ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
            # Linux specific tools for Cypress
            xvfb-run
            chromium
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
          ${pkgs.lib.optionalString pkgs.stdenv.isLinux ''
            export CYPRESS_RUN_BINARY=${pkgs.chromium}/bin/chromium
          ''}

          # Preserve existing Xcode setup on macOS
          if [[ "${system}" == "aarch64-darwin" ]]; then
            # Save current xcode-select path before Nix potentially overrides it
            ORIGINAL_DEVELOPER_DIR=$(xcode-select -p 2>/dev/null || echo "")

            # If we have a valid Xcode installation, preserve it
            if [[ -d "/Applications/Xcode.app" ]] || [[ -d "$HOME/Applications/Xcode-beta.app" ]]; then
              # Prefer user's Xcode-beta if it exists
              if [[ -d "$HOME/Applications/Xcode-beta.app" ]]; then
                export DEVELOPER_DIR="$HOME/Applications/Xcode-beta.app/Contents/Developer"
              elif [[ -d "/Applications/Xcode.app" ]]; then
                export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
              fi

              # Put real Xcode tools first in PATH
              export PATH="$DEVELOPER_DIR/usr/bin:$PATH"

              echo "iOS Development: Using Xcode at $DEVELOPER_DIR"
            fi
          fi

          # Set up Ruby gem paths
          export GEM_HOME="$PWD/.gems"
          export GEM_PATH="$GEM_HOME"
          export PATH="$GEM_HOME/bin:$PATH"

          # Install gems directly with gem command if not already installed
          if ! command -v kamal &> /dev/null; then
            echo "Installing gems..."
            gem install kamal -v 2.7.0
          fi
        '';
      };
    });
}
