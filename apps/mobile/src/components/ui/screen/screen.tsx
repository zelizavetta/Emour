import { View, ViewProps, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { colors } from "@/constants/colors";
import Header from "@/components/Header";


type ScreenProps = ViewProps & {
  hasHeader?: boolean
  onRefresh?: () => Promise<void>
}

export default function Screen({
    children,
    hasHeader = true,
    onRefresh,
    style,
    ...props
  }: ScreenProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  return(
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.wrapper}
    >
      {hasHeader ? <Header></Header> : <></>}
      <ScrollView
        contentContainerStyle={[styles.container, styles.scrollContent, style]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.active} colors={[colors.active]} />
          ) : undefined
        }
        {...props}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});