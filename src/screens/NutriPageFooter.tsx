import React from 'react';
import {AuthFooter} from './AuthChrome';
export default function NutriPageFooter({darkMode=false,onPrivacy}:{darkMode?:boolean;onPrivacy?:()=>void}){return <AuthFooter dark={darkMode} onPrivacy={onPrivacy}/>;}
