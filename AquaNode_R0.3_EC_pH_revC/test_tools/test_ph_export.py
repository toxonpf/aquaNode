import unittest
from export_ph_calibration import make_header

class PHExportTests(unittest.TestCase):
    def setUp(self):
        self.c=dict(cal_id='fixture',adc_mv_low=1000,ph_low=4,adc_mv_high=700,ph_high=7,temperature_c=25)
    def test_export_keeps_acceptance_flags_false(self):
        h=make_header(self.c)
        self.assertIn('PH_SUPPLY_VALIDATED=false',h)
        self.assertIn('PH_COEXISTENCE_VALIDATED=false',h)
    def test_bad_ids(self):
        for v in ['SYNTHETIC-NOT-FOR-HARDWARE','bad"id','',None,'a'*65]:
            with self.subTest(v=v),self.assertRaises(ValueError):make_header(dict(self.c,cal_id=v))
    def test_bad_measurements(self):
        for key,value in [('adc_mv_low',float('nan')),('adc_mv_low',700),('adc_mv_high',1700),('ph_high',15),('ph_high',4.1),('temperature_c',85)]:
            with self.subTest(key=key,value=value),self.assertRaises(ValueError):make_header(dict(self.c,**{key:value}))

if __name__=='__main__':unittest.main()
