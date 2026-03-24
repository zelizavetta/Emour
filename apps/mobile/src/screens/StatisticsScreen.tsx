import React, { useState } from 'react';
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

    const data = [
        { date: '2026-03-24', value: ['1', '2', '5'] },
        { date: '2026-03-25', value: ['1', '2', '7'] },
        { date: '2026-03-26', value: [] },
        { date: '2026-03-27', value: ['8'] },
    ]

    const dropDownData = [
        { label: 'Состояния', value: 'feeling' },
        { label: 'Симптомы', value: 'symptoms' },
        { label: 'Триггеры', value: 'triggers' },
        { label: 'Сон', value: 'sleep' },
    ];

    const activeValues = Object.keys(checked).filter(k => checked[k]);
    const filteredData = data.filter(item =>
        activeValues.some(v => item.value.includes(v))
    );

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

    return(
        <View style={styles.container}>
            {renderLabel()}
            <List.AccordionGroup>
                <List.Accordion
                    title="Тип 1" id="1"
                >
                    {["1", "2", "3", "4"].map((item) => (
                        <List.Item
                            key={item}
                            title={`Item ${item}`}
                            onPress={() => toggle(item)}
                            left={() => (
                            <Checkbox
                                status={checked[item] ? "checked" : "unchecked"}
                            />
                            )}
                        />
                    ))}
                    <List.Item title="Настроение" />
                    <List.Item title="Тревога" />
                    <List.Item title="Энергия" />
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
                current={'2026-03-24'}
                // Callback that gets called when the user selects a day
                onDayPress={day => {
                    console.log('selected day', day);
                }}
                // Mark specific dates as marked
                markedDates={markedDates}
            />
      </View>
        
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