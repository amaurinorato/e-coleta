import Constants from 'expo-constants'
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, Linking} from 'react-native'
import { Feather as Icon, FontAwesome } from '@expo/vector-icons' 
import { useNavigation, useRoute } from '@react-navigation/native'
import { RectButton } from 'react-native-gesture-handler'
import api from '../../services/api'
import * as Mail from 'expo-mail-composer'
import { MailComposerStatus } from 'expo-mail-composer';

interface Params {
    point_id: number
}

interface Data{
    serializedPoint: {
        image: string,
        name: string,
        email: string,
        whatsapp: string,
        city: string,
        uf: string,
        image_url: string
    },
    items: {
        title: string
    }[]
}

const Detail = () => {
    const [data, setData] = useState<Data>({} as Data);
    const navigation = useNavigation();
    const route = useRoute();
    
    const routeParam = route.params as Params;
    
    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleComposeMail() {
        Mail.composeAsync({
            subject: 'Interesse em coleta de resíduos',
            recipients: [data.serializedPoint.email],

        })
    }

    function handleWhatsapp() {
        Linking.openURL(`whatsapp://send?phone=${data.serializedPoint.whatsapp}&text=Tenho interesse sobre coleta de resíduos`)
    }

    useEffect(() => {
        api.get(`points/${routeParam.point_id}`).then(response => {
          console.log(response.data)
            setData(response.data);
        })
    }, [])

    if (!data.serializedPoint)
        return null

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb29"></Icon>
                </TouchableOpacity>
                <Image style={styles.pointImage} source={{uri: data.serializedPoint.image_url}}></Image>
                <Text style={styles.pointName}>{data.serializedPoint.name}</Text>
                <Text style={styles.pointItems}>{data.items.map(item => {return item.title}).join(', ')}</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{data.serializedPoint.city}, {data.serializedPoint.uf}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <RectButton onPress={() => {handleWhatsapp()}} style={styles.button}> 
                    <FontAwesome name="whatsapp" size={20} color="#FFF">
                        <Text style={styles.buttonText}>Whatsapp</Text>
                    </FontAwesome>
                </RectButton>

                <RectButton onPress={() => {handleComposeMail()}} style={styles.button}> 
                    <Icon name="mail" size={20} color="#FFF">
                        <Text style={styles.buttonText}>Email</Text>
                    </Icon>
                </RectButton>
            </View>
        </SafeAreaView>
        )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      paddingTop: 5 + Constants.statusBarHeight,
    },
  
    pointImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
      borderRadius: 10,
      marginTop: 32,
    },
  
    pointName: {
      color: '#322153',
      fontSize: 28,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    pointItems: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    address: {
      marginTop: 32,
    },
    
    addressTitle: {
      color: '#322153',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
  
    addressContent: {
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: '#999',
      paddingVertical: 20,
      paddingHorizontal: 32,
      paddingBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    
    button: {
      width: '48%',
      backgroundColor: '#34CB79',
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      marginLeft: 8,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
    },
  });

export default Detail;