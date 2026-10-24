#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Fais setup — detected $(uname -s) / $(uname -m)"
echo 'Internet is required. Missing system tools may require your administrator password.'
read -r -p 'Check/install tools and set up Fais? [y/N] ' answer
[[ "$answer" =~ ^[Yy]$ ]] || exit 0
case "$(uname -s)" in
  Darwin)
    if ! command -v brew >/dev/null; then
      echo 'Homebrew is needed. Its official installer may request Xcode Command Line Tools.'
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    if [[ -x /opt/homebrew/bin/brew ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; else eval "$(/usr/local/bin/brew shellenv)"; fi
    if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a===24&&b>=14?0:1)' 2>/dev/null; then
      brew install node@24
      export PATH="$(brew --prefix node@24)/bin:$PATH"
    fi
    if ! command -v mongod >/dev/null; then
      brew tap mongodb/brew
      brew install mongodb-community@8.0
    fi
    if brew list --formula mongodb-community@8.0 >/dev/null 2>&1; then brew services start mongodb-community@8.0; fi
    read -r -p 'Install MongoDB Compass graphical database viewer? [Y/n] ' compass
    if [[ ! "$compass" =~ ^[Nn]$ ]] && [[ ! -d /Applications/MongoDB\ Compass.app ]]; then brew install --cask mongodb-compass; fi
    ;;
  Linux)
    . /etc/os-release
    if [[ "${ID:-}" != ubuntu ]] || [[ ! "${VERSION_ID:-}" =~ ^(22.04|24.04)$ ]]; then
      echo 'Automatic Linux installation supports Ubuntu 22.04/24.04 only. See SETUP-COLLEGE.md for manual setup on other distributions.'; exit 1
    fi
    sudo apt-get update
    sudo apt-get install -y curl ca-certificates gnupg xz-utils
    if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a===24&&b>=14?0:1)' 2>/dev/null; then
      case "$(uname -m)" in x86_64) arch=x64;; aarch64) arch=arm64;; *) echo 'Unsupported CPU'; exit 1;; esac
      nodefile="node-v24.14.0-linux-$arch.tar.xz"
      toolsdir="$HOME/.local/share/fais-tools"
      mkdir -p "$toolsdir"
      curl -fL "https://nodejs.org/dist/v24.14.0/$nodefile" -o "$toolsdir/$nodefile"
      curl -fL https://nodejs.org/dist/v24.14.0/SHASUMS256.txt -o "$toolsdir/SHASUMS256.txt"
      (cd "$toolsdir"; grep "  $nodefile$" SHASUMS256.txt | sha256sum -c -)
      tar -xJf "$toolsdir/$nodefile" -C "$toolsdir"
      export PATH="$toolsdir/node-v24.14.0-linux-$arch/bin:$PATH"
    fi
    if ! command -v mongod >/dev/null; then
      curl -fsSL https://pgp.mongodb.com/server-8.0.asc | sudo gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-8.0.gpg
      echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
      sudo apt-get update
      sudo apt-get install -y mongodb-org
    fi
    sudo systemctl start mongod
    read -r -p 'Install MongoDB Compass graphical database viewer? [Y/n] ' compass
    if [[ ! "$compass" =~ ^[Nn]$ ]] && ! command -v mongodb-compass >/dev/null; then
      if [[ "$(uname -m)" == x86_64 ]]; then
        compassfile="${TMPDIR:-/tmp}/fais-compass-1.52.0.deb"
        curl -fL https://downloads.mongodb.com/compass/mongodb-compass_1.52.0_amd64.deb -o "$compassfile"
        sudo apt-get install -y "$compassfile"
      else echo 'Install Compass manually for your architecture if available. Fais itself does not require Compass.'; fi
    fi
    ;;
  *) echo 'On Windows use setup.ps1 in PowerShell. See SETUP-COLLEGE.md.'; exit 1;;
esac
node scripts/setup/project.mjs
