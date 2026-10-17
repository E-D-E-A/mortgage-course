"""The course's tiny seeded generator, written again in Python from its definition (mulberry32, 32-bit
integers), for the stage-8 checks that draw synthetic data (pricingmodel, calibration, estimate, pipeline).
It must give the same sequence as src/lib/calc/montecarlo.ts's makeRng. Nothing is imported from src/.
"""
M32 = 0xFFFFFFFF


def _imul(a, b):
    return (a * b) & M32


class Rng:
    def __init__(self, seed):
        self.a = seed & M32

    def next32(self):
        self.a = (self.a + 0x6D2B79F5) & M32
        t = self.a
        t = _imul(t ^ (t >> 15), t | 1)
        t ^= (t + _imul(t ^ (t >> 7), t | 61)) & M32
        return (t ^ (t >> 14)) & M32

    def below(self, n):
        """A whole number from 0 to n - 1: floor(x * n / 2^32)."""
        return (self.next32() * n) >> 32
