import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export type NutriTab = 'home'|'plan'|'log'|'charts'|'track'|'team'|'events'|'assessment'|'programs'|'privacy';
type NavTab = 'home'|'plan'|'log'|'charts'|'track'|'team'|'events';
const TABS: { id: NavTab; label: string }[] = [
  {id:'home',label:'Home'}, {id:'plan',label:'Plan'}, {id:'log',label:'Log'},
  {id:'charts',label:'Charts'}, {id:'track',label:'Track'},
  {id:'team',label:'Team'}, {id:'events',label:'Events'},
];
// React Native requires static image paths for bundled assets.
const ICONS = {
  home: {light: require('../../assets/navigation/home-light.png'), dark: require('../../assets/navigation/home-dark.png')},
  plan: {light: require('../../assets/navigation/plan-light.png'), dark: require('../../assets/navigation/plan-dark.png')},
  log: {light: require('../../assets/navigation/log-light.png'), dark: require('../../assets/navigation/log-dark.png')},
  charts: {light: require('../../assets/navigation/charts-light.png'), dark: require('../../assets/navigation/charts-dark.png')},
  track: {light: require('../../assets/navigation/track-light.png'), dark: require('../../assets/navigation/track-dark.png')},
  team: {light: require('../../assets/navigation/team-light.png'), dark: require('../../assets/navigation/team-dark.png')},
  events: {light: require('../../assets/navigation/events-light.png'), dark: require('../../assets/navigation/events-dark.png')},
};
export default function NutriBottomNav({active,onChange,darkMode}:{active:NutriTab;onChange:(tab:NutriTab)=>void;darkMode:boolean}) {
  const {width} = useWindowDimensions();
  const compact = width < 420;
  const surface = darkMode ? '#162D2A' : '#FFFFFF';
  const activeBg = darkMode ? '#174E48' : '#D7F5EB';
  const labelColor = darkMode ? '#D4E8E2' : '#526B64';
  return (
    <View style={[styles.outer, {backgroundColor:surface, borderTopColor:darkMode?'#31514B':'#D7EAE1'}]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TABS.map(({id,label}) => {
          const selected = active === id;
          return (
            <TouchableOpacity key={id} onPress={() => onChange(id)} accessibilityRole="tab"
              accessibilityLabel={label} accessibilityState={{selected}}
              activeOpacity={0.75} style={[styles.tab, compact && styles.tabCompact, selected && {backgroundColor:activeBg}]}>
              <Image source={ICONS[id][darkMode?'dark':'light']} style={[styles.icon,compact && styles.iconCompact]} resizeMode="contain" />
              <Text numberOfLines={1} style={[styles.label,compact && styles.labelCompact,{color:selected?(darkMode?'#A4FFE9':'#006C5D'):labelColor,fontWeight:selected?'800':'600'}]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  outer:{borderTopWidth:1,paddingTop:7,paddingBottom:9,paddingHorizontal:5},
  row:{flexGrow:1,justifyContent:'space-around',alignItems:'center',gap:2},
  tab:{minWidth:48,flexGrow:1,alignItems:'center',justifyContent:'center',paddingVertical:6,paddingHorizontal:3,borderRadius:13},
  tabCompact:{minWidth:43,paddingHorizontal:1},
  icon:{width:25,height:25,marginBottom:4}, iconCompact:{width:22,height:22},
  label:{fontSize:11},labelCompact:{fontSize:9},
});
