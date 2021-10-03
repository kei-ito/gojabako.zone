import {AuthorLinks} from '../AuthorLinks';
import {className} from './style.module.css';

export const Footer = () => <footer className={className.footer}>
    <div className={className.line}>
        <span>&copy; 2013- Kei Ito</span>
        <AuthorLinks/>
    </div>
</footer>;
