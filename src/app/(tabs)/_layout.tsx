import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

function TabGlyph({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View style={[styles.glyphWrap, focused && styles.glyphWrapActive]}>
      <Text style={[styles.glyph, focused && styles.glyphActive]}>
        {symbol}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 2,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          fontFamily: theme.fonts.body,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabGlyph focused={focused} symbol="◆" />
          ),
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: "Editor",
          tabBarIcon: ({ focused }) => (
            <TabGlyph focused={focused} symbol="✎" />
          ),
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "View",
          tabBarIcon: ({ focused }) => (
            <TabGlyph focused={focused} symbol="◉" />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabGlyph focused={focused} symbol="★" />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: "Files",
          tabBarIcon: ({ focused }) => (
            <TabGlyph focused={focused} symbol="▣" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glyphWrap: {
    minWidth: 32,
    height: 28,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 0,
  },
  glyphWrapActive: {
    backgroundColor: theme.colors.text,
  },
  glyph: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  glyphActive: {
    color: theme.colors.white,
  },
});
