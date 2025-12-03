import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { TechniqueDetail } from './techniques/technique-detail/technique-detail';

export const routes: Routes = [
    { path: '', component: Home},
    { path: 'about', component: About},
    { path: 'techniques/:techniqueId', component:TechniqueDetail}
];
