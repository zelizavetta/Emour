import Button from "@/components/ui/button";
import Card from "@/components/ui/card/card";
import { PopupWindow } from "@/components/ui/popupWindow";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { useUserRecords } from "@/providers/UserContext";
import { Note } from "@emour/core";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";


export default function NotesScreen() {
    const { notes, addNote } = useUserRecords()
    const [openNotePopup, setOpenNotePopup] = useState<boolean>(false)
    const [currentNote, setCurrentNote] = useState<Note | null>(null)
    const [noteTitle, setNoteTitle] = useState("")
    const [noteText, setNoteText] = useState("")
    return(
        <Screen>
            <TextWrapper>
                Дневник
            </TextWrapper>
            <Button onPress={() => addNote("New note", "")}>
                + Запись
            </Button>
            <View>
                {notes.map((note) => (
                    <Pressable onPress={() => {setCurrentNote(note); setOpenNotePopup(true)}}>
                        <Card key={note.id}>
                            <TextWrapper>
                                {note.title}
                            </TextWrapper>
                            <TextWrapper style={{ height: 100 }}>
                                {note.text}
                            </TextWrapper>
                        </Card>
                    </Pressable>
                ))}
            </View>
            <PopupWindow
                style={{ width: "100%", height: "100%" }}
                visible={openNotePopup} 
                onClose={() => {setOpenNotePopup(false)}}
            >
                <View style={{ width: "100%", marginRight: "auto" }}>
                    <TextInput 
                        defaultValue={currentNote?.title}
                        maxLength={100} 
                        multiline={true} 
                        onChangeText={(text) => setNoteTitle(text)}
                        placeholder="New note"
                    />
                    <TextInput
                        defaultValue={currentNote?.text}
                        multiline={true} 
                        onChangeText={(text) => setNoteText(text)}
                        placeholder="Enter text..."
                    />
                </View>
            </PopupWindow>
        </Screen>
    )
}