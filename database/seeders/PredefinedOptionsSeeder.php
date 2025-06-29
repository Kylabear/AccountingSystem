<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PredefinedOption;

class PredefinedOptionsSeeder extends Seeder
{
    public function run()
    {
        // Fund Sources
        $fundSources = [
            'GASS-GMS', 'GASS-APB', 'STO ICTMS', 'STO DOPP-PMED', 'STO DOPP-CRA', 'STO DOPP-F2C2',
            'STO ILD', 'STO FPMA', 'STO FPMA-RICE', 'STO FPMA-LVSTK', 'STO FPMA-CORN', 'STO FPMA-HVCDP',
            'STO FPMA-OAP', 'STO FPMA-UPAP', 'STO AFESA', 'STO QRF', 'PSS RICE', 'PSS LVSTK',
            'PSS CORN', 'PSS HVCDP', 'PSS OAP', 'OTHER PSS', 'OTHER PSS-RD', 'OTHER PSS-RICE',
            'OTHER PSS-CORN', 'OTHER PSS-LVSTK', 'OTHER PSS-HVCDP', 'PSS UPAP', 'MDS', 'ESETS RICE',
            'ESETS LVSTK', 'ESETS CORN', 'ESETS HVCDP', 'ESETS OAP', 'OTHER ESETS', 'ESETS HALAL',
            'ESETS UPAP', 'RD RICE', 'RD LVSTK', 'RD CORN', 'OTHER RD', 'PAEF RICE', 'PAEF LVSTK',
            'PAEF CORN', 'PAEF HVCDP', 'PAEF OAP', 'PAEF UPAP', 'INS RICE', 'INS CORN', 'INS HVCDP',
            'INS OAP', 'FMR', 'QCI', 'RL', 'SAAD', 'SAAD PHASE II', 'CRA', 'BP2', 'RSBSA',
            '4K PROJECT', 'YFCF', 'RCEF RFFA', 'KAKP', 'SPF QRF-RRP', 'SPF QRF-RCP', 'SPF QRF-RLP',
            'SPF QRF-RHVCDP', 'SPF QRF-ROAP', 'SPF QRF-DRRMO', 'PGF-GASS', 'MPBF-GASS', 'FUEL ASSISTANCE',
            'YFC PROGRAM', 'RCEP', 'FFED PROGRAM (SAGIP SAKA ACT)', 'PRDP SCALE-UP', 'DAP', 'SIRP',
            'PRDP SCALE-UP GOP', 'NSHP (Nat\'l Soil HP)', 'CSEP (Cold Storage EP)', 
            'IFFE (Farmers & Fisherfolk Enterprise)', 'PIS'
        ];

        // Transaction Types
        $transactionTypes = [
            'Professional/General/Job Order Services',
            'Communication (Telephone/Internet)',
            'Electricity/Water',
            'Supplies (office and other supplies)',
            'Seeds/fertilizer/medicine/drugs',
            'Equipment/Machinery/Motor Vehicles/Furniture and Fixtures',
            'Infrastructure - mobilization, partial and final billings',
            'Biological Assets',
            'Training- Meals, Snacks and Accommodation',
            'Remittances/Loans',
            'Fund Transfers',
            'Retention',
            'Salaries/Wages/Allowances/Benefit',
            'TEV inc. toll fees',
            'Fuel'
        ];

        // Implementing Units
        $implementingUnits = [
            'RAED', 'SAAD', 'REGULATORY', 'RESEARCH', 'ILSD', 'AFD', 'RICE', 'CORN', 'LIVESTOCK',
            'OAP', 'HVCDP', '4K', 'F2C2', 'AMAD', 'PMED', 'BP2', 'OTHERS'
        ];

        // Insert Fund Sources
        foreach ($fundSources as $source) {
            PredefinedOption::firstOrCreate([
                'type' => PredefinedOption::TYPE_FUND_SOURCE,
                'value' => $source,
                'is_predefined' => true
            ]);
        }

        // Insert Transaction Types
        foreach ($transactionTypes as $type) {
            PredefinedOption::firstOrCreate([
                'type' => PredefinedOption::TYPE_TRANSACTION_TYPE,
                'value' => $type,
                'is_predefined' => true
            ]);
        }

        // Insert Implementing Units
        foreach ($implementingUnits as $unit) {
            PredefinedOption::firstOrCreate([
                'type' => PredefinedOption::TYPE_IMPLEMENTING_UNIT,
                'value' => $unit,
                'is_predefined' => true
            ]);
        }
    }
}
