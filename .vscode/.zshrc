# Source the user's normal .zshrc first
if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc"
fi

# Keep history in the normal location
export HISTFILE="$HOME/.zsh_history"

# Source the local setup script
if [ -f "$PWD/deno/local-setup.sh" ]; then
  . "$PWD/deno/local-setup.sh"
fi 