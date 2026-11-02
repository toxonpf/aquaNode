import unittest, math
from ec_model import calibrate,estimate as raw_estimate,curve,validate_calibration
def estimate(*args,**kwargs):
    return raw_estimate(*args,**kwargs,supply_validated=True)


class ECTests(unittest.TestCase):
    def setUp(self):
        # Invented voltage points for software tests only, never deploy these coefficients.
        self.cal=calibrate(.2,147,1.6,1413,cal_id='SYNTHETIC-NOT-FOR-HARDWARE')
        self.cal['temperature_validated']=True # synthetic test of arithmetic only

    def test_no_calibration_no_ec(self):
        self.assertIsNone(estimate(1.,25)['ec25_estimated_us_cm'])

    def test_reproduces_calibration_points(self):
        self.assertAlmostEqual(estimate(.2,25,self.cal)['ec25_estimated_us_cm'],147)
        self.assertAlmostEqual(estimate(1.6,25,self.cal)['ec25_estimated_us_cm'],1413)

    def test_temperature_normalization(self):
        a=estimate(1.,25,self.cal)['ec25_estimated_us_cm']
        b=estimate(1.,30,self.cal)['ec25_estimated_us_cm']
        self.assertAlmostEqual(b,a/1.1)

    def test_no_voltage_extrapolation(self):
        self.assertEqual(estimate(1.7,25,self.cal)['status'],'outside_calibration_voltage')

    def test_no_compensated_ec_extrapolation(self):
        self.assertEqual(estimate(1.6,10,self.cal)['status'],'outside_calibration_ec')

    def test_disconnect_temperature_and_nan_rejected(self):
        for t in [-127,85,float('nan'),float('inf')]:
            self.assertIsNone(estimate(1,t,self.cal)['ec25_estimated_us_cm'])

    def test_adc_low_high_and_unstable(self):
        for v in [0,.1,2.4,float('nan')]:
            self.assertIsNone(estimate(v,25,self.cal)['ec25_estimated_us_cm'])
        self.assertEqual(estimate(1,25,self.cal,41)['status'],'unstable_adc')

    def test_calibration_rejects_bad_points(self):
        for args in [(1,147,1,1413),(.2,1413,1.6,147),(.1,147,1.6,1413),(.2,147,1.6,3000)]:
            with self.assertRaises(ValueError):calibrate(*args,cal_id='test')
        with self.assertRaises(ValueError):calibrate(.2,147,1.6,1413,low_t=20,cal_id='test')

    def test_corrupted_coefficients_fail(self):
        bad=dict(self.cal,gain=1)
        self.assertEqual(estimate(1,25,bad)['status'],'invalid_calibration')
        self.assertEqual(estimate(1,25,{'schema':'wrong'})['status'],'invalid_calibration')

    def test_curve_monotonic_in_electrical_scope(self):
        values=[curve(i/1000) for i in range(150,2301)]
        self.assertTrue(all(a<b for a,b in zip(values,values[1:])))


class RevisionGates(unittest.TestCase):
    def test_supply_gate(self):
        self.assertEqual(raw_estimate(1,25)['status'],'supply_unvalidated')
    def test_temperature_gate(self):
        c=calibrate(.2,147,1.6,1413,cal_id='SYNTHETIC')
        self.assertEqual(estimate(1,30,c)['status'],'temperature_compensation_unvalidated')
    def test_identifier_safe_for_json(self):
        for ident in ['bad"id','bad\\id','a'*65,'']:
            with self.assertRaises(ValueError):calibrate(.2,147,1.6,1413,cal_id=ident)
    def test_negative_noise(self):
        self.assertEqual(estimate(1,25,spread_mv=-1)['status'],'unstable_adc')
    def test_bool_is_not_a_voltage(self):
        self.assertEqual(estimate(True,25)['status'],'invalid_input')

if __name__=='__main__':unittest.main()

