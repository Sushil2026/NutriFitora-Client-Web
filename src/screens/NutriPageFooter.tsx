import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function BotanicalAccent({ dark = false }: { dark?: boolean }) {
  const leaf = dark ? '#235F50' : '#A9D98A';
  return <View pointerEvents="none" style={s.leaves}>
    <View style={[s.stem, { backgroundColor: dark ? '#3E9377' : '#85BD6D' }]} />
    {([[25,28,-32],[65,20,35],[24,76,-40],[75,70,40],[58,108,25]] as number[][]).map(([x,y,r],i) =>
      <View key={i} style={{ position:'absolute', left:x, top:y, width:51, height:24, borderTopLeftRadius:48, borderBottomRightRadius:48, backgroundColor:leaf, transform:[{rotate:`${r}deg`}] }} />)}
  </View>;
}

/** Same botanical waves and footer order as the Login page in App.tsx. */
export default function NutriPageFooter({ darkMode = false }: { darkMode?: boolean }) {
  return <View style={s.wrapper}>
    <View pointerEvents="none" style={s.waves}>
      <View style={[s.waveOne,{backgroundColor:darkMode?'#174F47':'#D9F2D1'}]} />
      <View style={[s.waveTwo,{backgroundColor:darkMode?'#227568':'#AFE4A0'}]} />
      <BotanicalAccent dark={darkMode} />
    </View>
    <Text style={[s.footer,{color:darkMode?'#A0B7A6':'#9AA69D'}]}>Your wellness, one choice at a time.</Text>
  </View>;
}
const s=StyleSheet.create({
  wrapper:{width:'100%',alignItems:'center'},
  waves:{height:98,overflow:'hidden',width:'100%',position:'relative',marginTop:18},
  waveOne:{position:'absolute',left:-45,right:-45,top:26,height:170,borderTopLeftRadius:170,borderTopRightRadius:220,transform:[{rotate:'-6deg'}]},
  waveTwo:{position:'absolute',left:-40,right:-45,top:56,height:150,borderTopLeftRadius:190,borderTopRightRadius:170,transform:[{rotate:'5deg'}]},
  leaves:{position:'absolute',bottom:-18,right:-22,width:145,height:150,opacity:0.72},
  stem:{position:'absolute',left:70,top:20,width:3,height:124,transform:[{rotate:'35deg'}]},
  footer:{fontSize:12,marginTop:22,textAlign:'center'},
});
