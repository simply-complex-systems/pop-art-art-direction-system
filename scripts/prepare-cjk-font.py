# Optional maintenance tool: fonttools==4.61.1, brotli==1.2.0; source TTC from licensed Noto CJK distribution. Not needed for npm build.
from fontTools.ttLib import TTFont
from fontTools import subset
from pathlib import Path
r=Path(__file__).resolve().parents[1];f=TTFont('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',fontNumber=2)
options=subset.Options(); options.name_IDs=['*']; options.name_legacy=True;options.name_languages=['*'];options.recalc_bounds=True
s=subset.Subsetter(options=options);s.populate(unicodes=list(range(0x3000,0xa000))+list(range(0xac00,0xd7b0))+list(range(0xff00,0xfff0))+list(range(0x1100,0x1200))+list(range(0x3130,0x3190)))
s.subset(f)
for rec in f['name'].names:
 if rec.nameID in [1,2,3,4,6,16,17]:
  label={1:'Pop Art CJK Fallback',2:'Regular',3:'PopArtCJKFallback-Regular-1',4:'Pop Art CJK Fallback Regular',6:'PopArtCJKFallback-Regular',16:'Pop Art CJK Fallback',17:'Regular'}[rec.nameID]
  rec.string=label.encode(rec.getEncoding())
if 'CFF ' in f:
 c=f['CFF '].cff;c.fontNames=['PopArtCJKFallback-Regular'];c.topDictIndex[0].FullName='Pop Art CJK Fallback Regular';c.topDictIndex[0].FamilyName='Pop Art CJK Fallback'
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
gs=f.getGlyphSet();order=f.getGlyphOrder();glyphs={}
for name in order:
 pen=TTGlyphPen(None);q=Cu2QuPen(pen,max_err=1.0,reverse_direction=True);gs[name].draw(q);glyphs[name]=pen.glyph()
fb=FontBuilder(f['head'].unitsPerEm,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(f.getBestCmap());fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(f['hmtx'].metrics);fb.setupHorizontalHeader(ascent=f['hhea'].ascent,descent=f['hhea'].descent);fb.setupNameTable({'familyName':'Pop Art CJK Fallback','styleName':'Regular','uniqueFontIdentifier':'PopArtCJKFallback-Regular-1','fullName':'Pop Art CJK Fallback Regular','psName':'PopArtCJKFallback-Regular','version':'Version 1.0','copyright':'© 2014-2021 Adobe (http://www.adobe.com/). Noto distribution notices also credit Google Corporation. Renamed derivative: Pop Art CJK Fallback.'});fb.setupOS2(sTypoAscender=f['OS/2'].sTypoAscender,sTypoDescender=f['OS/2'].sTypoDescender,usWinAscent=f['OS/2'].usWinAscent,usWinDescent=f['OS/2'].usWinDescent);fb.setupPost();fb.setupMaxp();import io,gzip
finalSubset=subset.Subsetter();finalSubset.populate(unicodes=fb.font.getBestCmap());finalSubset.subset(fb.font);fb.font['name'].setName('Licensed under the SIL Open Font License, Version 1.1; see bundled OFL-CJK.txt.',13,3,1,0x409);fb.font['name'].setName('https://openfontlicense.org/',14,3,1,0x409);fb.font['glyf'].padding=4;buffer=io.BytesIO();fb.save(buffer);(r/'src/pdf/fonts/PopArtCJKFallback.ttf.gz').write_bytes(gzip.compress(buffer.getvalue(),mtime=0))


raw=Path('/usr/share/doc/fonts-noto-cjk/copyright').read_text();license=raw[raw.index('License: SIL-1.1\n ----'):raw.find('\nLicense: GPL-3+',raw.index('License: SIL-1.1\n ----'))].replace(' .\n','\n')
(r/'src/pdf/fonts/OFL-CJK.txt').write_text('Source font copyright metadata: © 2014-2021 Adobe (http://www.adobe.com/).\nCopyright 2010-2012 Google Corporation.\nDerived from Noto Sans CJK SC Regular, https://github.com/notofonts/noto-cjk\nRenamed subset: Pop Art CJK Fallback. Core CJK, kana, Hangul, fullwidth punctuation; excludes rare extension ideographs.\n\n'+license)
