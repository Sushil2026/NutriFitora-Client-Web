import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

type Props = { darkMode?: boolean; onToggleTheme?: () => void; onLogout?: () => void; customerName?: string; navigationLabel?: string; onNavigate?: () => void };
export default function NutriPageHeader({ darkMode = false, onToggleTheme, onLogout, customerName, navigationLabel, onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  return (
    <View style={[s.panel, compact && s.mobile, { borderColor: darkMode ? '#45604B' : '#C8DED0' }]}>
      <View pointerEvents="none" style={s.leaves}>
        <View style={[s.stem, { backgroundColor: darkMode ? '#3E9377' : '#85BD6D' }]} />
        {([[10,12,-32],[55,4,35],[12,62,-40],[63,55,40],[48,95,25]] as number[][]).map(([x,y,r],i) => <View key={i} style={{ position:'absolute', left:x, top:y, width:49,height:23,borderTopLeftRadius:48,borderBottomRightRadius:48, backgroundColor:darkMode?'#235F50':'#A9D98A', transform:[{rotate:`${r}deg`}] }} />)}
      </View>
      <View style={s.top}>
        <Image source={darkMode ? require('../../assets/NutriFitora_logo_white.png') : require('../../assets/NutriFitora_logo.png')} style={[s.logo,compact && s.logoCompact]} resizeMode="contain" accessibilityLabel="NutriFitora logo" />
        <View style={s.actions}>
          {!!onToggleTheme && <TouchableOpacity onPress={onToggleTheme} accessibilityRole="switch" accessibilityState={{checked:darkMode}} accessibilityLabel={darkMode?'Switch to light mode':'Switch to dark mode'} style={[s.toggle,compact&&s.toggleCompact,{backgroundColor:darkMode?'#123D35':'#F9FFF8',borderColor:darkMode?'#4BAA95':'#79C96E',justifyContent:darkMode?'flex-start':'flex-end'}]}>
            <View style={[s.thumb,compact&&s.thumbCompact,{backgroundColor:darkMode?'#2C7667':'#A8EA8D'}]}><Text style={[s.icon,compact&&s.iconCompact,{color:darkMode?'#FFFFFF':'#174A30'}]}>{darkMode?'☾':'☀'}</Text></View>
          </TouchableOpacity>}
          {!!onLogout && <TouchableOpacity onPress={onLogout} accessibilityRole="button" accessibilityLabel="Logout" style={[s.logout,{backgroundColor:darkMode?'#F4F8F4':'#006746'}]}>
            <Text style={[s.logoutIcon,{color:darkMode?'#246B4A':'#FFFFFF'}]}>⇥</Text><Text style={[s.logoutText,{color:darkMode?'#246B4A':'#FFFFFF'}]}>Logout</Text>
          </TouchableOpacity>}
        </View>
      </View>
      <Text style={[s.tagline,{color:darkMode?'#F0F7F1':'#1C4933'},compact&&s.taglineCompact]}><Text style={{color:darkMode?'#91D9AA':'#399466',fontStyle:'italic',fontWeight:'600'}}>Small steps.</Text>{'\n'}Healthier you.</Text>
      {!!customerName && <Text style={[s.greeting,{color:darkMode?'#B4CBBE':'#557364'}]}>Hello, {customerName}!</Text>}
      {!!navigationLabel && !!onNavigate && <TouchableOpacity onPress={onNavigate} accessibilityRole="button" style={[s.nav,{borderColor:darkMode?'#91F1B5':'#006846'}]}><Text style={{color:darkMode?'#91F1B5':'#006846',fontWeight:'700',fontSize:13}}>{navigationLabel}</Text></TouchableOpacity>}
    </View>
  );
}
const s=StyleSheet.create({panel:{width:'100%',maxWidth:780,alignSelf:'center',borderWidth:1,borderRadius:20,paddingHorizontal:18,paddingTop:12,paddingBottom:12,marginBottom:18,overflow:'hidden',position:'relative'},mobile:{paddingHorizontal:14,paddingTop:8,paddingBottom:12,borderRadius:19},leaves:{position:'absolute',top:-14,left:-12,width:145,height:150,opacity:0.55},stem:{position:'absolute',left:61,top:15,width:3,height:120,transform:[{rotate:'35deg'}]},top:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',minHeight:86},logo:{width:180,height:80},logoCompact:{width:148,height:70},actions:{flexDirection:'row',alignItems:'center',gap:8,paddingTop:8},toggle:{width:72,height:38,borderRadius:22,borderWidth:1.5,flexDirection:'row',alignItems:'center',paddingHorizontal:3},toggleCompact:{width:52,height:28,borderRadius:16,borderWidth:1,paddingHorizontal:2},thumb:{width:30,height:30,borderRadius:15,alignItems:'center',justifyContent:'center'},thumbCompact:{width:22,height:22,borderRadius:11},icon:{fontSize:21,lineHeight:26},iconCompact:{fontSize:15,lineHeight:19},logout:{width:66,height:66,borderRadius:12,alignItems:'center',justifyContent:'center'},logoutIcon:{fontSize:27,lineHeight:31,fontWeight:'700'},logoutText:{fontSize:11,fontWeight:'700'},tagline:{fontSize:29,lineHeight:36,fontWeight:'800',letterSpacing:-0.6,marginTop:2,marginLeft:2},taglineCompact:{fontSize:25,lineHeight:32},greeting:{fontSize:14,fontWeight:'600',marginTop:12},nav:{alignSelf:'flex-start',marginTop:10,paddingVertical:8,paddingHorizontal:14,borderRadius:20,borderWidth:1}});
