import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, TextInputProps, StyleProp, TextStyle} from 'react-native';

type Props = TextInputProps & {dark: boolean; fieldStyle?: StyleProp<TextStyle>};
export default function PasswordField({dark, fieldStyle, ...props}: Props) {
  const [visible, setVisible] = useState(false);
  const color = dark ? '#A8EA8D' : '#087F72';
  return <View style={{position:'relative', width:'100%'}}>
    <TextInput {...props} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} style={[fieldStyle,{paddingRight:54}]} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible?'Hide password':'Show password'} accessibilityState={{selected:visible}} onPress={()=>setVisible(v=>!v)} style={s.toggle}>
      <View pointerEvents="none" style={s.icon}>
        <View style={[s.eye,{borderColor:color}]} />
        <View style={[s.pupil,{backgroundColor:color}]} />
        {visible && <View style={[s.slash,{backgroundColor:color,borderColor:dark?'#22352A':'#FFFFFF'}]} />}
      </View>
    </TouchableOpacity>
  </View>;
}
const s=StyleSheet.create({
  toggle:{position:'absolute',right:3,top:0,bottom:0,width:44,alignItems:'center',justifyContent:'center'},
  icon:{width:26,height:26,alignItems:'center',justifyContent:'center'},
  eye:{width:21,height:15,borderWidth:1.8,borderTopLeftRadius:13,borderBottomRightRadius:13,borderTopRightRadius:5,borderBottomLeftRadius:5,transform:[{rotate:'-12deg'}]},
  pupil:{position:'absolute',width:7,height:7,borderRadius:4},
  slash:{position:'absolute',width:29,height:3,borderRadius:2,borderWidth:0.5,transform:[{rotate:'45deg'}]},
});
