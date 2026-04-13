''''''''''''''''''''''''''''''''RETRY_2D.BAS'''''''''''''''''''''''''''''''''
'  This program just tracks a "particle" in a 2-D circle.  It goes a
'  random length then turns a random angle.  The length it travels is a
'  Monte Carlo decaying exponential where L=e^-U.  It calculate a new
'  energy and a new path while it is still inside.  This version also
'  correctly distributes the scattering angle over Klein-Nishina and
'  sin(theta) from the Jacobian.
'

DIM PATHL(1000)
DIM SPECTRUM(2048)
DIM SMOOTHUM(2048)
DIM RADA(1024)
DIM SCARY(1024)
CLS
SCREEN 12
RANDOMIZE (TIMER)
PI = 4 * ATN(1)
CLS
LOCATE 30, 2: PRINT "0KeV      10           20          30          40          50          60"
LOCATE 1, 1: PRINT "                   Von Neuman Simulation of Am241 Spectrum"

IF CHWID = 0 THEN CHWID = .1542
IF DETRES = 0 THEN DETRES = .055

LINE (0, 0)-(0, 459), 2
LINE (0, 459)-(640, 459), 2
FOR XX = 0 TO 60 STEP 10
  LINE (1.5 * XX / CHWID, 459)-(1.5 * XX / CHWID, 463), 14
NEXT XX


LOCATE 9, 3: PRINT "Compton Statistics:"
1
' New events should begin here
EVENTS = EVENTS + 1
IF EVENTS > 1000 THEN GOTO 9999
' Set the initial position and energy
GOSUB AMEMIT
X1 = 0
Y1 = 0
' NSCAT will count how many times it scatters before it is out
NSCAT = 0
' Determine the initial direction.  Isotropic for this and not Klein
THETA = RND * 2 * PI
' Determine how far it goes
100 GOSUB PATHLEN
' If x-ray scattered calculations should continue here each time after
' new energy is calculated
' Calculate the new positon in cartesian
X1 = X1 + L * COS(THETA)
Y1 = Y1 + L * SIN(THETA)
' Determine the distance from where it began (first time D = L as
' returned by PATHLEN call)
D = SQR(X1 ^ 2 + Y1 ^ 2)
' If it is outside then it will be detected, and a new one will be emitted
' Else, if it is still in it gets scattered
IF D > 1 THEN
'  PSET (400 + 20 * X1, 200 - 20 * Y1), 4
  GOSUB RECORDIT
  SCARY(NSCAT) = SCARY(NSCAT) + 1
  LOCATE 10 + NSCAT, 2: PRINT NSCAT; SCARY(NSCAT)
  GOTO 1
ELSE
'  PSET (400 + 20 * X1, 200 - 20 * Y1)
  ' If the most recent interaction was Photoelectric, then it was
  ' absorbed and we need to start a new one.  Comment this and there
  ' will be more multiple scatters.
  IF RND < UPP THEN GOTO 1
  ' What is the angle at which it scatters
  GOSUB KLEIN
  ' Calculate the energy after the scatter since it is still inside
  E0 = (E0 / (1 + (E0 / 511) * (1 - COS(PI - SCATHETA))))
  ' It has scattered one more time so increment nscat
  IF E0 < 2.5 THEN GOTO 1
  NSCAT = NSCAT + 1
  GOTO 100
END IF

9999
DO
LOOP WHILE INKEY$ = ""
GOSUB SAVIT
END



PATHLEN:
'  This subroutine calculates a pathlength based on the total cross section
'  carried by the variable UT
GOSUB PLASCR
REJ:
  U = UT
  F = 10000 * RND
  A = EXP(-F * U)
IF RND > A THEN GOTO REJ
L = F
'SUBSCRIPT = INT(10 * L)
'PATHL(SUBSCRIPT) = PATHL(SUBSCRIPT) + .3
'CIRCLE (SUBSCRIPT, 200 - PATHL(SUBSCRIPT)), 1, 0
'CIRCLE (SUBSCRIPT, 201 - PATHL(SUBSCRIPT)), 1, 5
RETURN


PLASCR:
'  This subroutine calculates photo, compton and total cross sections
'  for plastic for a given energy, E0
IF E0 = 0 THEN GOTO OUTER
Z = 14
MW = 28
DENS = 1.1
con = .4988 * Z
ar = .602 / MW
AC = con * ar
  A = E0 / 511
  C1 = (1 + A) / (A * A)
  C2 = 2 * (1 + A) / (1 + 2 * A)
  C3 = (LOG(1 + 2 * A)) / A
  C4 = (LOG(1 + 2 * A)) / (2 * A)
  C5 = (1 + 3 * A) / ((1 + 2 * A) * (1 + 2 * A))
  CC = AC * C1 * (C2 - C3) + C4 - C5
  PE = 1050 * (1 / E0) ^ (2.75)
  TOT = CC + PE
  UC = CC * DENS
  UP = PE * DENS
  UT = TOT * DENS
  UCP = UC / UT
  UPP = UP / UT
'  PSET (20 + E0, 300 - 10 * UC)
'  PSET (100 + E0, 300 - 10 * UP)
'  PSET (180 + E0, 300 - 10 * UT)
OUTER:
RETURN



RECORDIT:
'  This subroutine records the spectrum graphically
PHOTENRG = E0
SUM01 = 0
SIGMA = DETRES * SQR(PHOTENRG)
FOR I = 1 TO 12
  SUM01 = SUM01 + RND
NEXT I
VAR = SUM01 - 6
ENREC = SIGMA * VAR + PHOTENRG
CHANNEL = INT(ENREC / CHWID) + 1
IF CHANNEL < 1 THEN CHANNEL = 1
IF CHANNEL > 2048 THEN CHANNEL = 2048
SPECTRUM(CHANNEL) = SPECTRUM(CHANNEL) + 1
CIRCLE (1.5 * CHANNEL, 459 - SPECTRUM(CHANNEL)), 1, 0
CIRCLE (1.5 * CHANNEL, 458 - SPECTRUM(CHANNEL)), 1, 2
IF CHANNEL > THEEND THEN THEEND = CHANNEL
RETURN


KLEIN:
PI = 4 * ATN(1)
R0 = 1
KE = E0 / 511
SCATHETA = RND * PI
TR = RND
  N1 = 1 - COS(SCATHETA)
  N2 = 1 + (COS(SCATHETA) ^ 2)
  SN1 = (KE * N2) ^ 2
  SN2 = N2 * (1 + KE * (N1))
  P1 = (1 / (1 + KE * (N1))) ^ 2
  P2 = N2 / 2
  P3 = 1 + (SN1 / SN2)
  R = SIN(PI - SCATHETA) * R0 ^ 2 * P1 * P2 * P3
IF TR < R THEN
  INDEX = INT(100 * SCATHETA) + 1
  RADA(INDEX) = RADA(INDEX) + 2
'  PSET (100 + (RADA(INDEX) * COS(SCATHETA)), 100 - (RADA(INDEX) * SIN(SCATHETA))), 7
ELSE
  GOTO KLEIN
END IF
RETURN

AMEMIT:
'  This subroutine generates what energies are emitted from an Am241 source
'  at the appropriate proportionalities.
NEWNRG = 0
P1:
  WP = INT(RND * 9) + 1
  IF WP = 1 THEN
   RAND = RND
   IF RAND < 1 THEN
    PHOTENRG = 59.54
    NEWNRG = 1
   END IF
  END IF
  IF WP = 2 THEN
   IF RAND < .06 THEN
    PHOTENRG = 26.36
    NEWNRG = 1
   END IF
  END IF
  IF WP = 3 THEN
   IF RAND < .01 THEN
    PHOTENRG = 21.43
    NEWNRG = 1
   END IF
  END IF
  IF WP = 4 THEN
   IF RAND < .01 THEN
    PHOTENRG = 21.09
    NEWNRG = 1
   END IF
  END IF
  IF WP = 5 THEN
   IF RAND < .05 THEN
    PHOTENRG = 20.79
    NEWNRG = 1
   END IF
  END IF
  IF WP = 6 THEN
   IF RAND < .2 THEN
    PHOTENRG = 17.78
    NEWNRG = 1
   END IF
  END IF
  IF WP = 7 THEN
   IF RAND < .04 THEN
    PHOTENRG = 17.06
    NEWNRG = 1
   END IF
  END IF
  IF WP = 8 THEN
   IF RAND < .04 THEN
    PHOTENRG = 16.82
    NEWNRG = 1
   END IF
  END IF
  IF WP = 9 THEN
   IF RAND < .13 THEN
    PHOTENRG = 13.95
    NEWNRG = 1
   END IF
  END IF

IF NEWNRG = 0 THEN GOTO P1
E0 = PHOTENRG
RETURN


SAVIT:
OPEN "SIMUL.DAT" FOR OUTPUT AS #2
FOR I = 1 TO THEEND
    WRITE #2, I, SPECTRUM(I)
NEXT I
CLOSE #2
RETURN

