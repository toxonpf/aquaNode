import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import FlexibleArrow from './FlexibleArrow';

export default function ArrowLink({to,children}:{to:string;children:ReactNode}){
  return <Link className="arrow-link" to={to}>{children}<span className="arrow-link-icon"><FlexibleArrow direction="up-right"/></span></Link>;
}
