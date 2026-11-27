import React from 'react';
import {AuthHeader} from './AuthChrome';
type Props={darkMode?:boolean;onToggleTheme?:()=>void;onLogout?:()=>void;customerName?:string;navigationLabel?:string;onNavigate?:()=>void};
export default function NutriPageHeader({darkMode=false,onToggleTheme,onLogout,customerName,navigationLabel,onNavigate}:Props){return <AuthHeader dark={darkMode} onToggle={onToggleTheme} onLogout={onLogout} customerName={customerName} navigationLabel={navigationLabel} onNavigate={onNavigate}/>;}
