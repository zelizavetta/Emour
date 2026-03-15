import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Carousel, { TCarouselProps } from "react-native-reanimated-carousel";


export default function CarouselWrapper({ data }) {
    const ref = useRef(null);
    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(500);

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
                renderItem={({ item }) => (
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
    width: "100%"
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