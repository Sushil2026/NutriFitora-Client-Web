import React from 'react';
import {View, Text, Image, TouchableOpacity, useWindowDimensions} from 'react-native';
export function AuthHeader({dark,onToggle,onHome,onLogout,customerName,navigationLabel,onNavigate}:{dark:boolean;onToggle?:()=>void;onHome?:()=>void;onLogout?:()=>void;customerName?:string;navigationLabel?:string;onNavigate?:()=>void}) {
 const {width}=useWindowDimensions(); const small=width<480; const fg=dark?'#E4F5E9':'#15543F';
 return <><View style={{width:'100%',flexShrink:0,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:small?10:20,paddingVertical:5,borderRadius:14,backgroundColor:dark?'#203C32':'#E4F2E7',borderWidth:1,borderColor:dark?'#456657':'#C8DED0'}}>
 <Image source={dark?require('../../assets/NutriFitora_logo_white.png'):require('../../assets/NutriFitora_logo.png')} resizeMode="contain" style={{width:small?94:142,height:42}} accessibilityLabel="NutriFitora"/>
 <View style={{flex:1,minWidth:0}}><Text style={{color:fg,fontWeight:'700',fontSize:small?11:15}}>Small steps. Healthier you.</Text>{!!customerName && <Text numberOfLines={1} style={{color:fg,fontSize:small?10:12}}>Welcome, {customerName}</Text>}</View>
 {onHome && <TouchableOpacity onPress={onHome} accessibilityRole="button" accessibilityLabel="Back to Home" style={{width:44,height:44,flexShrink:0,borderRadius:14,backgroundColor:dark?'#315044':'#FFFFFF',borderWidth:1,borderColor:dark?'#567C68':'#B8D8C5',alignItems:'center',justifyContent:'center'}}>
 <View accessible={false} style={{width:26,height:26,alignItems:'center',justifyContent:'center'}}>
 <View style={{position:'absolute',top:3,width:17,height:17,borderTopWidth:2.5,borderLeftWidth:2.5,borderColor:fg,transform:[{rotate:'45deg'}],borderTopLeftRadius:2}}/>
 <View style={{position:'absolute',top:11,width:17,height:13,borderWidth:2.5,borderTopWidth:0,borderColor:fg,borderBottomLeftRadius:3,borderBottomRightRadius:3,alignItems:'center',justifyContent:'flex-end'}}><View style={{width:5,height:8,backgroundColor:fg,borderTopLeftRadius:1,borderTopRightRadius:1}}/></View>
 </View></TouchableOpacity>}
 {onToggle && <TouchableOpacity onPress={onToggle} accessibilityRole="switch" accessibilityState={{checked:dark}} accessibilityLabel="Toggle dark mode" style={{width:44,height:44,borderRadius:22,backgroundColor:dark?'#315044':'#FFFFFF',alignItems:'center',justifyContent:'center'}}><Text style={{color:fg,fontSize:21}}>{dark?'☾':'☀'}</Text></TouchableOpacity>}
 {onLogout && <TouchableOpacity onPress={onLogout} accessibilityRole="button" accessibilityLabel="Logout" style={{minHeight:44,justifyContent:'center',paddingHorizontal:8,borderRadius:10,backgroundColor:dark?'#315044':'#006746'}}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>{small?'⇥':'Logout'}</Text></TouchableOpacity>}
 </View>{navigationLabel && onNavigate && <TouchableOpacity onPress={onNavigate} accessibilityRole="button" style={{alignSelf:'flex-start',padding:10}}><Text style={{color:fg,fontWeight:'700'}}>{navigationLabel}</Text></TouchableOpacity>}</>;
}
export function AuthFooter({dark,onPrivacy}:{dark:boolean;onPrivacy?:()=>void}) {
 const fg=dark?'#B2D0C1':'#526F62';
 return <View style={{width:'100%',flexShrink:0,gap:3,paddingTop:5}}>
 <View pointerEvents="none" style={{height:20,overflow:'hidden',borderRadius:8}}><View style={{position:'absolute',left:-20,right:-20,top:6,height:65,borderTopLeftRadius:180,borderTopRightRadius:180,backgroundColor:dark?'#174F47':'#D9F2D1',transform:[{rotate:'-2deg'}]}}/><View style={{position:'absolute',left:-20,right:-20,top:13,height:60,borderTopLeftRadius:180,borderTopRightRadius:180,backgroundColor:dark?'#227568':'#AFE4A0',transform:[{rotate:'2deg'}]}}/></View>
 <Text style={{color:fg,textAlign:'center',fontSize:12}}>Your wellness, one choice at a time.</Text>
 <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',alignItems:'center',gap:10}}>{onPrivacy && <TouchableOpacity onPress={onPrivacy} accessibilityRole="link" style={{minHeight:32,justifyContent:'center'}}><Text style={{color:fg,textDecorationLine:'underline',fontSize:12}}>Privacy Policy</Text></TouchableOpacity>}<Text style={{color:fg,fontSize:11}}>© {new Date().getFullYear()} NutriFitora</Text></View>
 </View>;
}
