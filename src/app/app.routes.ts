import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { TechniqueDetail } from './techniques/technique-detail/technique-detail';
import { WeaknessDetail } from './weaknesses/weakness-detail/weakness-detail';
import { MitigationDetail } from './mitigations/mitigation-detail/mitigation-detail';
import { Techniques } from './techniques/techniques';
import { Weaknesses } from './weaknesses/weaknesses';
import { Mitigations } from './mitigations/mitigations';

export const routes: Routes = [
    { path: '', component: Home},
    { path: 'about', component: About},
    { path: 'techniques', component: Techniques},
    { path: 'techniques/:techniqueId', component: TechniqueDetail},
    { path: 'weaknesses', component: Weaknesses},
    { path: 'weaknesses/:weaknessId', component: WeaknessDetail},
    { path: 'mitigations', component: Mitigations},
    { path: 'mitigations/:mitigationId', component: MitigationDetail}
];
