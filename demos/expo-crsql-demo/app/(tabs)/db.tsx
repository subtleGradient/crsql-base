import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedView as View } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
			headerImage={
				<IconSymbol
					size={310}
					color="#808080"
					name="network.slash"
					style={styles.headerImage}
				/>
			}
		>
			<View style={styles.titleContainer}>
				<Text type="title">cr-sqlite</Text>
			</View>
			<Text>Example of using cr-sqlite</Text>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	headerImage: {
		color: "#808080",
		bottom: -90,
		left: -35,
		position: "absolute",
	},
	titleContainer: {
		flexDirection: "row",
		gap: 8,
	},
});
