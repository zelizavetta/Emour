import { PopupWindow } from '@/components/popupWindow';
import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import { useFeelings } from '@/providers/UserContext';
import { Feeling } from '@emour/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';
import { List, Checkbox } from 'react-native-paper';


export default function StatisticScreen() {
    const [selected, setSelected] = useState('');
    const [value, setValue] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const [expandedFeeling, setExpandedFeeling] = React.useState(false);
    const [expandedSymptoms, setExpandedSymptoms] = React.useState(false);
    const [expandedTriggers, setExpandedTriggers] = React.useState(false);
    const [checked, setChecked] = React.useState<Record<string, boolean>>({});
    const [openDayPopup, setOpenDayPopup] = useState<boolean>(false)
    const [pressedDay, setPressedDay] = useState<string>('')
    const { feelings, addFeelingRecord } = useFeelings()
    const [moodRecords, setMoodRecords] = useState([])
    const [energyRecords, setEnergyRecords] = useState([])
    const [anxietyRecords, setAnxietyRecords] = useState([])
    const [data, setData] = useState<StatisticDataItem[]>([])
    const currentDate = new Date().toISOString().slice(0, 10)

    const items = [
        {value: 'mood-low', label: 'Плохое настроение', expression: (score: number) => score < 3}, 
        {value: 'energy-high', label: 'Высокая энергия', expression: (score: number) => score > 3}, 
        {value: 'anxiety-high', label: 'Высокая тревога', expression: (score: number) => score > 3}, 
        {value: 'mood-high', label: 'Хорошее настроение', expression: (score: number) => score > 3}, 
        {value: 'energy-low', label: "Низкая энергия", expression: (score: number) => score < 3},
        {value: 'anxiety-low', label: "Низкая тревога", expression: (score: number) => score < 3}, 
    ]

    const dayPartMap = [
        { value: 'evening', label: 'вечер'},
        { value: 'morning', label: 'утро'},
        { value: 'night', label: 'ночь'},
        { value: 'afternoon', label: 'день'},
    ]

    type StatisticDataItem = {
        date: string,
        value: any[]
    }
    function transform(data: Feeling[]) : StatisticDataItem[]{
        const map = data.reduce<Record<string, any>>((acc, feel) => {
            const day = new Date(feel.createdAtClient).toISOString().slice(0, 10);
            if (!acc[day]) {
                acc[day] = [];
            }
            console.log('acc[day]', acc[day])
            const matched = items.filter(item => item.expression(feel.score) && item.value.split("-")[0] === feel.feelingType)
            if (matched.length !== 0) {
                acc[day].push({value: matched[0].value, dayPart: feel.dayPart, score: feel.score})
            }
            // const matched = items.filter(item => item.expression(feel.score) && item.value.split("-")[0] === feel.feelingType)
            // matched.map(item => {
            //     if (acc[day].findIndex(v => v.value === item.value) === -1) {
            //         acc[day].push({value: item.value, time: })
            //     }
            // })
            return acc;
        }, {});

        return Object.entries(map).map(([date, value]) => ({
            date,
            value,
        }));
    }

    useEffect(() => {
        if (feelings.length === 0) {
            return
        }
        const dataItems = transform(feelings)
        setData(dataItems)
    }, [feelings]);

    // const data = [
    //     { date: '2026-03-24', value: ['1', '2', '5'] },
    //     { date: '2026-03-25', value: ['1', '2', '7'] },
    //     { date: '2026-03-26', value: [] },
    //     { date: '2026-03-27', value: ['8'] },
    // ]

    const dropDownData = [
        { label: 'Состояния', value: 'feeling' },
        { label: 'Симптомы', value: 'symptoms' },
        { label: 'Триггеры', value: 'triggers' },
        { label: 'Сон', value: 'sleep' },
    ];

    const activeValues = Object.keys(checked).filter(k => checked[k]);
    const filteredData = activeValues.length ? data.filter(item =>
        activeValues.every(val => item.value.map(v => v.value).includes(val))
    ) : [];

    console.log('activeValues: ', activeValues)
    console.log('filteredData: ', filteredData)

    type MarkedDates = Record<
        string,
        {
            selected?: boolean;
            marked?: boolean;
            selectedColor?: string;
        }
    >;

    const markedDates = filteredData.reduce<MarkedDates>((acc, item) => {
        acc[item.date] = {
            selected: true,
            selectedColor: 'blue',
        };
        return acc;
    }, {});

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };

    const toggle = (key: string) => {
        setChecked((prev) => ({
        ...prev,
        [key]: !prev[key],
        }));
    };

    console.log('data:', data)
    console.log('checked', checked)
    console.log('date', currentDate)

    return(
        <Screen>
            {renderLabel()}
            <List.AccordionGroup>
                <List.Accordion
                    title="Состояния" id="1"
                >
                    {items.map((item) => (
                        <List.Item
                            style={{backgroundColor: "white"}}
                            key={item.value}
                            title={item.label}
                            onPress={() => toggle(item.value)}
                            left={() => (
                            <Checkbox
                                status={checked[item.value] ? "checked" : "unchecked"}
                            />
                            )}
                        />
                    ))}
                </List.Accordion>
                {/* <List.Accordion
                    title="Симптомы"
                    expanded={expandedSymptoms}
                    onPress={() => setExpandedSymptoms((prev) => !prev)}
                >
                    <List.Item title="Галлюцинации">
                    </List.Item>
                    <List.Item title="Тремор" />
                    <List.Item title="Спутанность мыслей" />
                    <List.Item title="Апатия" />
                    <List.Item title="Странные мысли" />
                </List.Accordion>
                <List.Accordion
                    title="Триггеры"
                    expanded={expandedTriggers}
                    onPress={() => setExpandedTriggers((prev) => !prev)}
                >
                    <List.Item title="Недостаток сна" />
                    <List.Item title="Социальная изоляция" />
                    <List.Item title="Долгое нахождение дома" />
                    <List.Item title="Стресс" />
                </List.Accordion> */}
            </List.AccordionGroup>
            <Calendar
                // Customize the appearance of the calendar
                style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    height: 350
                }}
                // Specify the current date
                current={currentDate}
                // Callback that gets called when the user selects a day
                onDayPress={day => {
                    setPressedDay(day.dateString)
                    setOpenDayPopup(true)
                }}
                // Mark specific dates as marked
                markedDates={markedDates}
            />
            <PopupWindow visible={openDayPopup} onClose={() => {console.log('pressedDay: ', pressedDay); setOpenDayPopup(false)}}>
                <View>
                    <TextWrapper variant='title' style={{color: 'black'}}>
                        В этот день:
                    </TextWrapper>
                    {data.filter(item => item.date === pressedDay)[0]?.value.map((fvalue) => (
                        <TextWrapper key={fvalue.value} style={{ color: 'black' }}>
                            {`${dayPartMap.filter(day => day.value === fvalue.dayPart)[0].label}: ${items.filter(i => i.value === fvalue.value)[0].label}(${fvalue.score}/5)`}
                        </TextWrapper>
                    ))}
                </View>
            </PopupWindow>
      </Screen>
        
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });