import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NutriPageHeader from './NutriPageHeader';
import NutriPageFooter from './NutriPageFooter';

type Props={darkMode:boolean; customerName:string; onToggleTheme:()=>void; onLogout:()=>void; onAssessment:()=>void; onPrograms:()=>void};
export default function HomeScreen({darkMode,customerName,onToggleTheme,onLogout,onAssessment,onPrograms}:Props){
 const c=darkMode?{bg:'#101A16',card:'#1B2A23',soft:'#223E35',text:'#F1F7F2',muted:'#B2C4B7',line:'#34483B',teal:'#087E73'}:{bg:'#EDF7F3',card:'#FFFFFF',soft:'#DDF1E9',text:'#183B33',muted:'#658178',line:'#D6E9E0',teal:'#087F73'};
 return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={s.page}>
  <NutriPageHeader darkMode={darkMode} onToggleTheme={onToggleTheme} onLogout={onLogout} customerName={customerName}/>
  <Text style={[s.kicker,{color:c.muted}]}>YOUR WELLNESS SPACE</Text>
  <TouchableOpacity onPress={onPrograms} accessibilityRole="button" style={[s.hero,{backgroundColor:c.teal}]}>
   <Text style={s.heroLabel}>EXPLORE YOUR WELLNESS PLAN</Text><Text style={s.heroTitle}>Ignite 12 · Sample progress</Text>
   <Text style={s.heroBody}>Week 3 of 12 · Demo program — not your actual enrollment.</Text>
   <View style={s.heroButton}><Text style={s.heroButtonText}>Explore programs  →</Text></View>
  </TouchableOpacity>
  <View style={[s.nudge,{backgroundColor:darkMode?'#4B3D35':'#FCE8DF'}]}><Text style={[s.nudgeTitle,{color:darkMode?'#FFE2D3':'#543B32'}]}>Today's nudge</Text><Text style={[s.nudgeBody,{color:darkMode?'#F4D3C4':'#745E56'}]}>Water is low today. Try a glass with every meal. (Sample nudge)</Text></View>
  <Text style={[s.section,{color:c.text}]}>Your wellness at a glance <Text style={{fontSize:11,fontWeight:"500"}}>(sample)</Text></Text>
  <View style={s.grid}>{[['4','Glasses of water','Demo value'],['7h','Sleep','Demo value'],['73.2 kg','Weight','Demo value'],['3/5','Daily goals','Demo value']].map(([icon,label,detail])=><View key={label} style={[s.metric,{backgroundColor:c.soft}]}><Text style={s.metricIcon}>{icon}</Text><Text style={[s.metricName,{color:c.text}]}>{label}</Text><Text style={[s.metricNote,{color:c.muted}]}>{detail}</Text></View>)}</View>
  <TouchableOpacity onPress={onAssessment} style={[s.action,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.actionTitle,{color:c.text}]}>Complete your nutrition assessment  →</Text><Text style={[s.actionBody,{color:c.muted}]}>Share your goals, preferences and daily habits.</Text></TouchableOpacity>
  <View style={[s.action,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.actionTitle,{color:c.text}]}>Your care team</Text><Text style={[s.actionBody,{color:c.muted}]}>Meera Iyer (sample nutritionist). Open the Team tab for a demo chat.</Text></View>
  <View style={[s.action,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.actionTitle,{color:c.text}]}>5-day check-in streak (sample)</Text><Text style={[s.actionBody,{color:c.muted}]}>Daily check-ins keep weight off.</Text></View>
  <NutriPageFooter darkMode={darkMode}/>
 </ScrollView>;
}
const s=StyleSheet.create({page:{width:'100%',maxWidth:800,alignSelf:'center',paddingHorizontal:14,paddingTop:16,paddingBottom:30},kicker:{fontSize:11,fontWeight:'800',letterSpacing:1.2,marginTop:6},heading:{fontSize:25,fontWeight:'800',marginTop:6,marginBottom:18},hero:{borderRadius:18,padding:20,marginBottom:12},heroLabel:{color:'#CFF2E9',fontSize:10,fontWeight:'800',letterSpacing:1},heroTitle:{color:'#FFFFFF',fontSize:22,fontWeight:'800',marginTop:8},heroBody:{color:'#E1F7F1',fontSize:13,lineHeight:20,marginTop:7},heroButton:{alignSelf:'flex-start',backgroundColor:'#FFFFFF',borderRadius:10,paddingHorizontal:14,paddingVertical:10,marginTop:16},heroButtonText:{color:'#087F73',fontWeight:'800'},nudge:{borderRadius:14,padding:16,marginBottom:22},nudgeTitle:{fontSize:14,fontWeight:'800'},nudgeBody:{fontSize:13,lineHeight:20,marginTop:4},section:{fontSize:17,fontWeight:'800',marginBottom:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:14},metric:{width:'48%',flexGrow:1,borderRadius:14,padding:16,minHeight:114},metricIcon:{fontSize:22},metricName:{fontSize:15,fontWeight:'800',marginTop:6},metricNote:{fontSize:11,marginTop:4},action:{borderWidth:1,borderRadius:14,padding:17,marginBottom:10},actionTitle:{fontSize:14,fontWeight:'800'},actionBody:{fontSize:12,marginTop:5,lineHeight:19}});
