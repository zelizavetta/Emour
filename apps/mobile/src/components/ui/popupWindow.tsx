import { colors } from '@/constants/colors';
import React, {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, ViewProps} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import Button from './button';


type PopupWindowProps = ViewProps & {
    children: any,
    visible: boolean
    onClose: () => void
}

export function PopupWindow({ children, style, visible, onClose}: PopupWindowProps) {
//   const [modalVisible, setModalVisible] = useState(visible);
  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            // setModalVisible(!modalVisible);
          }}>
          <View style={[styles.centeredView, style]}>
            <View style={styles.modalView}>
              {children}
              <Button
                style={styles.button}
                // onPress={() => {setModalVisible(!modalVisible); onClose()}}>
                onPress={onClose}>
                Ок
              </Button>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 'auto',
        top: 'auto',
        zIndex: 1000,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "80%"
    },
    button: {
      marginTop: 16,
      marginHorizontal: "auto"
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: colors.text
    },
});