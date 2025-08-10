// This is a fake package to prevent react-native from being hoisted to the root
// This ensures that react-native dependencies stay within their respective packages
throw new Error("This is a fake react-native package for blocking hoisting. Do not import.");