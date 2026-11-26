import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TextInput, TouchableOpacity, View, StyleSheet, useWindowDimensions} from 'react-native';
const icons = {
 dashboard: ['📊','#D9F4E7','#245C48'], clients: ['👥','#DBEAFE','#244A75'],
 approvals: ['📋','#EDE9FE','#514075'], roster: ['🗓️','#FFEDD5','#704C29'],
 chats: ['💬','#CFFAFE','#235B65'], active: ['👥','#D9F4E7','#245C48'],
 new: ['👤','#DBEAFE','#244A75'], paused: ['⏸️','#FEF3C7','#665323'],
 expired: ['⌛','#FCE7F3','#703B56'], counselling: ['📞','#D9F4E7','#245C48'],
 followup: ['🔔','#FFEDD5','#704C29'], diet: ['🥗','#EDE9FE','#514075'],
 activity: ['📈','#CFFAFE','#235B65'],
} as const;
type IconName = keyof typeof icons;
function ColorIcon({name,dark,compact=false}:{name:IconName;dark:boolean;compact?:boolean}) {
 const [symbol,lightBg,darkBg]=icons[name];
 const size=compact?32:40;
 return <View accessible={false} style={{width:size,height:size,borderRadius:compact?10:13,backgroundColor:dark?darkBg:lightBg,alignItems:'center',justifyContent:'center',flexShrink:0}}><Text style={{fontSize:compact?19:23,lineHeight:compact?26:30,textAlign:'center'}}>{symbol}</Text></View>;
}
type Task={id:string;kind:string;name:string;program:string;dueAt:string};
type Activity={id:string;name:string;type:string;occurredAt:string};
type Overview={activeClients:number;newClients:number;pausedClients:number;expiredClients:number;tasks:Task[];activity:Activity[]};
export default function DashboardScreen({token,apiUrl,dark,name,onLogout}:{token:string;apiUrl:string;dark:boolean;name:string;onLogout:()=>void}){
 const {width}=useWindowDimensions();
 const [contentWidth,setContentWidth]=useState(0);
 const available=contentWidth || Math.min(1240,width-28);
 const compact=available<560;
 const statColumns=available>=1100?4:available>=300?2:1;
 const taskColumns=available>=560?2:1;
 const tileWidth=(columns:number)=>Math.max(0,(available-12*(columns-1))/columns);
 const [data,setData]=useState<Overview|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[query,setQuery]=useState('');
 const [section,setSection]=useState('Dashboard');
 const load=useCallback(async(signal?:AbortSignal)=>{setBusy(true);setError('');try{const res=await fetch(`${apiUrl}/api/nutritionist/overview`,{headers:{Authorization:`Bearer ${token}`},signal});if(!res.ok)throw new Error(res.status===401?'Session expired. Please log out and sign in again.':`Dashboard unavailable (HTTP ${res.status}).`);const result=await res.json();if(!signal?.aborted)setData(result);}catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'Unable to load dashboard.');}finally{if(!signal?.aborted)setBusy(false);}},[apiUrl,token]);
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[load]);
 const c=dark?{bg:'#123D35',card:'#173F36',text:'#F1FAF3',muted:'#B7D5C5',line:'#45604B',accent:'#A8EA8D'}:{bg:'#E4F3EB',card:'#FFFFFF',text:'#163D32',muted:'#567367',line:'#C8DED0',accent:'#087F72'};
 const text={color:c.text}, muted={color:c.muted}, card={backgroundColor:c.card,borderColor:c.line};
 const match=(s:string)=>s.toLowerCase().includes(query.trim().toLowerCase());
 const format=(v:string)=>new Date(v).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 const groups=[['counselling',"Today's counselling"],['followup',"Today's follow-up"],['diet','Diets pending']];
 return <View onLayout={e=>setContentWidth(e.nativeEvent.layout.width)} style={{width:'100%',minWidth:0,gap:14}}>
 <View style={[s.nav,card,{flexWrap:'nowrap',gap:0,borderWidth:1}]}>{['Dashboard','Manage clients','Diet approvals','Roster','Chats'].map((tab,i)=><TouchableOpacity key={tab} accessibilityRole="tab" accessibilityState={{selected:section===tab}} onPress={()=>setSection(tab)} style={{flex:1,minWidth:0,minHeight:56,alignItems:'center',justifyContent:'center',paddingVertical:8,paddingHorizontal:2,gap:4,borderBottomWidth:2,borderBottomColor:section===tab?c.accent:'transparent'}}><ColorIcon name={(['dashboard','clients','approvals','roster','chats'] as const)[i]} dark={dark} compact={compact}/><Text style={{textAlign:'center',fontSize:compact?10:13,color:section===tab?c.accent:c.text,fontWeight:'700'}}>{compact?['Dashboard','Clients','Approvals','Roster','Chats'][i]:tab}</Text></TouchableOpacity>)}</View>
 {section!=='Dashboard'?<View style={[s.panel,card]}><Text style={[s.heading,text]}>{section}</Text><Text style={muted}>This module will be implemented in a later phase.</Text><TouchableOpacity onPress={()=>setSection('Dashboard')}><Text style={{color:c.accent,fontWeight:'700'}}>Back to dashboard</Text></TouchableOpacity></View>:<>
 <View style={s.nav}><View style={{flex:1,minWidth:0}}><Text style={[s.heading,text,{fontSize:compact?20:24}]}>Nutritionist Dashboard</Text><Text style={muted}>Welcome, {name} · Daily overview (IST)</Text></View><TouchableOpacity accessibilityRole="button" onPress={()=>void load()} disabled={busy} style={[s.panel,card,{padding:10}]}><Text style={{color:c.accent,fontWeight:'700'}}>Refresh</Text></TouchableOpacity></View>
 <TextInput value={query} onChangeText={setQuery} placeholder={compact?"Search clients or programs":"Search dashboard by client name or program"} placeholderTextColor={c.muted} style={[s.panel,card,text]} accessibilityLabel="Search dashboard"/>
 {busy&&<ActivityIndicator color={c.accent}/>}{!!error&&<View style={[s.panel,card]}><Text accessibilityRole="alert" style={text}>{error}</Text><TouchableOpacity onPress={onLogout}><Text style={{color:c.accent}}>Return to login</Text></TouchableOpacity></View>}
 <View style={{width:'100%',gap:12}}>{Array.from({length:Math.ceil(4/statColumns)},(_,row)=> <View key={row} style={{width:'100%',flexDirection:'row',gap:12}}>{([['Active clients',data?.activeClients],['New (15 days)',data?.newClients],['Paused',data?.pausedClients],['Expired (15 days)',data?.expiredClients]] as const).slice(row*statColumns,(row+1)*statColumns).map(([label,value])=><View key={label} style={[s.panel,{backgroundColor:c.bg,borderColor:c.line,flex:1,minWidth:0,padding:compact?10:14}]}><ColorIcon name={({'Active clients':'active','New (15 days)':'new','Paused':'paused','Expired (15 days)':'expired'} as const)[label]} dark={dark} compact={compact}/><Text style={[s.number,text]}>{value??'—'}</Text><Text style={muted}>{label}</Text></View>)}</View>)}</View>
 <View style={s.grid}>{groups.map(([kind,label])=>{const all=data?.tasks.filter(t=>t.kind===kind)??[];const rows=all.filter(t=>match(t.name+' '+t.program));return <View key={kind} style={[s.panel,card,{width:taskColumns===1?'100%':tileWidth(taskColumns)-1,minWidth:0}]}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><ColorIcon name={kind as 'counselling'|'followup'|'diet'} dark={dark}/><Text style={[s.subheading,text,{flex:1}]}>{label} · {data?all.length:'—'} left</Text></View>{rows.slice(0,8).map(t=><View key={t.id} style={{paddingVertical:8,borderBottomWidth:1,borderBottomColor:c.line}}><Text style={text}>{t.name} · {t.program}</Text><Text style={muted}>{format(t.dueAt)}</Text></View>)}{data&&!rows.length&&<Text style={muted}>No matching pending tasks.</Text>}{rows.length>8&&<Text style={muted}>Showing 8 of {rows.length} tasks.</Text>}</View>})}
 <View style={[s.panel,card,{width:taskColumns===1?'100%':tileWidth(taskColumns)-1,minWidth:0}]}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><ColorIcon name="activity" dark={dark}/><Text style={[s.subheading,text,{flex:1}]}>Recent client activity</Text></View>{data?.activity.filter(a=>match(a.name)).map(a=><View key={a.id} style={{paddingVertical:8,borderBottomWidth:1,borderBottomColor:c.line}}><Text style={text}>{a.name} {a.type==='weight_logged'?'logged their weight':a.type==='food_logged'?'logged food':'updated progress'}.</Text><Text style={muted}>{format(a.occurredAt)}</Text></View>)}{data&&!data.activity.filter(a=>match(a.name)).length&&<Text style={muted}>No matching activity yet.</Text>}</View></View>
 </>}
 </View>;
}
const s=StyleSheet.create({nav:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:6,borderRadius:12},grid:{width:'100%',flexDirection:'row',flexWrap:'wrap',justifyContent:'flex-start',gap:12},panel:{borderWidth:1,borderRadius:14,padding:14,gap:8},heading:{fontSize:24,fontWeight:'800'},subheading:{fontSize:16,fontWeight:'700'},number:{fontSize:28,fontWeight:'800'}});
