import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AuthHeader, AuthFooter } from './AuthChrome';
type Props = { onBack: () => void; darkMode?: boolean; onToggleTheme?: () => void; onLogout?: () => void; customerName?: string };
const sections: Array<[string,string]> = [
 ['Information we collect','Add your verified description of customer information collected.'],
 ['How information is used','Explain your actual purposes for using customer information.'],
 ['Storage and security','Describe the measures and providers you actually use.'],
 ['Sharing and retention','Describe your actual sharing practices and retention periods.'],
 ['Your choices and contact','Add the correct contact method and applicable privacy rights.'],
];
/** Replace placeholder policy with approved, verified terms before publishing. */
export default function PrivacyPolicyScreen({ onBack, darkMode = false, onToggleTheme, onLogout, customerName }: Props) {
 const {width}=useWindowDimensions(); const mobile=width<600;
 const c=darkMode ? {bg:'#101A16',card:'#1B2A23',border:'#34483B',text:'#F1F7F2',muted:'#B2C4B7',accent:'#8DD5A9'} : {bg:'#F3FBF5',card:'#FFFFFF',border:'#E0EFE4',text:'#1C3327',muted:'#697B70',accent:'#246B4A'};
 return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={[s.page,{paddingHorizontal:mobile?10:24,paddingTop:10}]}>
  <View style={s.shell}>
   <AuthHeader dark={darkMode} onToggle={onToggleTheme} onLogout={onLogout} customerName={customerName} navigationLabel="← Back" onNavigate={onBack}/>
   <View style={[s.card,mobile&&s.mobile,{backgroundColor:c.card,borderColor:darkMode?'#58B98B':'#238B61'}]}>
    <Text style={[s.eyebrow,{color:c.accent}]}>NUTRIFITORA CUSTOMER PORTAL</Text>
    <Text style={[s.heading,{color:c.text}]}>Privacy Policy</Text>
    <Text style={[s.intro,{color:c.muted}]}>Please insert your approved NutriFitora Privacy Policy here before publishing this page.</Text>
    {sections.map(([heading,body])=><View key={heading} style={[s.section,{borderBottomColor:c.border}]}><Text style={[s.sectionHeading,{color:c.text}]}>{heading}</Text><Text style={[s.body,{color:c.muted}]}>{body}</Text></View>)}
   </View>
   <AuthFooter dark={darkMode} />
  </View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{flexGrow:1,alignItems:'stretch',paddingBottom:10},shell:{width:'100%',flexGrow:1,gap:12},card:{width:'100%',flexGrow:1,borderWidth:2,borderRadius:22,padding:32,shadowColor:'#1A4530',shadowOpacity:0.08,shadowRadius:24,shadowOffset:{width:0,height:9},elevation:4},mobile:{padding:20,borderRadius:19},eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.2,marginBottom:9},heading:{fontSize:27,fontWeight:'800',marginBottom:12},intro:{fontSize:14,lineHeight:22},section:{marginTop:22,paddingBottom:18,borderBottomWidth:1},sectionHeading:{fontSize:17,fontWeight:'700',marginBottom:7},body:{fontSize:16,lineHeight:26},footer:{fontSize:12,textAlign:'center',marginTop:22}});
