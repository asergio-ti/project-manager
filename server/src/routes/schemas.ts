import { Router } from 'express';
import { 
    coreSchemas,
    softwareSchemas,
    lifecycleSchemas,
    qualitySchemas,
    assuranceSchemas,
    dvpSchemas,
    drsSchemas,
    dasSchemas,
    dadiSchemas
} from '../schemas';

const router = Router();

// Rota para listar todos os schemas disponíveis
router.get('/', (req, res) => {
    const schemas = {
        core: coreSchemas,
        iso: {
            software: softwareSchemas,
            lifecycle: lifecycleSchemas,
            quality: qualitySchemas,
            assurance: assuranceSchemas
        },
        phases: {
            dvp: dvpSchemas,
            drs: drsSchemas,
            das: dasSchemas,
            dadi: dadiSchemas
        }
    };
    res.json(schemas);
});

// Rotas específicas para cada tipo de schema
router.get('/core', (req, res) => res.json(coreSchemas));

// Rotas ISO
router.get('/iso/software', (req, res) => res.json(softwareSchemas));
router.get('/iso/lifecycle', (req, res) => res.json(lifecycleSchemas));
router.get('/iso/quality', (req, res) => res.json(qualitySchemas));
router.get('/iso/assurance', (req, res) => res.json(assuranceSchemas));

// Rotas de Fases
router.get('/phases/dvp', (req, res) => res.json(dvpSchemas));
router.get('/phases/drs', (req, res) => res.json(drsSchemas));
router.get('/phases/das', (req, res) => res.json(dasSchemas));
router.get('/phases/dadi', (req, res) => res.json(dadiSchemas));

export default router; 