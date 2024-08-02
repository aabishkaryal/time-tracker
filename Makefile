include .env

build-macos:
	APPLE_CERTIFICATE="$(cat certificate-base64.txt)" cargo tauri build --target universal-apple-darwin