import { useState } from "react";
import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import TextWrapper from "@/components/ui/textWrapper";
import { colors } from "@/constants/colors";
import Button from "@/components/ui/button";


export default function AnxietySlider() {
  const [value, setValue] = useState(3);

  const emojiMap: Record<number, string> = {
    1: "😩",
    2: "🫤",
    3: "🙂",
    4: "😄",
    5: "🥳",
  };

  return (
    <View>
      <TextWrapper variant="title">
          Отметь текущую тревогу
      </TextWrapper>
      <TextWrapper style={styles.emoji}>{emojiMap[value]}</TextWrapper>

      <View style={styles.sliderWrapper}>
        <LinearGradient
          colors={[colors.danger, colors.orange, colors.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />

        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={value}
          onValueChange={setValue}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={colors.secondary}
        />
      </View>

      <View style={styles.labels}>
        <TextWrapper style={styles.label}>Очень низкая</TextWrapper>
        <TextWrapper style={styles.label}>Очень высокая</TextWrapper>
      </View>
      <Button variant="secondary" style={styles.button}>
        Готово
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderWrapper: {
    height: 24,
    justifyContent: "center",
    width: "90%",
    alignSelf: "center"
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    marginTop: -3,
    height: 6,
    borderRadius: 3,
  },
  slider: {
    width: "100%",
    height: 24,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    marginBottom: 0
  },

  emoji: {
    fontSize: 64,
    alignSelf: "center",
    marginBottom: 16,
  },
  button: {
    alignSelf: "center",
    marginTop: 16
  }
});