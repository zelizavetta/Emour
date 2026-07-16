import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

interface CarouselWrapperProps {
    data: React.ReactNode[];
}

export default function CarouselWrapper({ data }: CarouselWrapperProps) {
    const ref = useRef<ICarouselInstance>(null);
    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(290);

    return (
        <View 
            style={styles.container}
            onLayout={(e) => {
                setWidth(e.nativeEvent.layout.width);
                setHeight(e.nativeEvent.layout.height);
            }}
        >
            <Carousel
                loop
                enabled={false}
                ref={ref}
                width={width}
                height={height}
                data={data}
                scrollAnimationDuration={1000}
                renderItem={({ item }: { item: React.ReactNode }) => (
                    <View style={styles.container}>
                        {item}
                        <Pressable 
                            style={[styles.button, styles.buttonNext]}
                            onPress={() => ref.current?.next()} 
                        >
                            <Text style={styles.buttonText}>{">"}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonPrev]}
                            onPress={() => ref.current?.prev()}
                        >
                            <Text style={styles.buttonText}>{"<"}</Text>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "auto",
    minHeight: 290
  },
  button: {
    position: "absolute",
    top: "40%",
    backgroundColor: "inherit"
  },
  buttonNext: {
    right: 20
  },
  buttonPrev: {
    left: 20
  },
  buttonText: {
    color: "#ffffff70",
    fontSize: 24,
    fontWeight: 600
  }
});