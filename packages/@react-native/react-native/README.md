# Fake react-native Package

This is a fake package to block react-native from being hoisted to the root of the monorepo.

## Purpose

In monorepo setups, package managers may hoist dependencies to the root `node_modules` for deduplication. This can cause issues with React Native and Expo projects that expect react-native to be in their local `node_modules`.

By creating this fake package at the workspace root, we prevent the real react-native from being hoisted, ensuring it stays within the individual project directories where it's needed.

## Do Not Use

This package should never be imported or used directly. It exists solely for dependency management purposes.