# Optional authoring tool: ReportLab 4.x and bundled DejaVu font; not needed for npm build.
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from xml.sax.saxutils import escape
r=Path(__file__).resolve().parents[1];o=r/'orientation';pdfmetrics.registerFont(TTFont('Body',str(r/'src/pdf/fonts/DejaVuSans.ttf')))
s=getSampleStyleSheet();s.add(ParagraphStyle(name='BodyCustom',fontName='Body',fontSize=9.5,leading=14,spaceAfter=9,textColor=colors.HexColor('#203141')));s.add(ParagraphStyle(name='SectionCustom',keepWithNext=True,fontName='Body',fontSize=11,leading=15,spaceBefore=15,spaceAfter=8,textColor=colors.HexColor('#193e58')));s.add(ParagraphStyle(name='TitleCustom',fontName='Body',fontSize=18,leading=24,spaceAfter=18))
def footer(c,d):
 c.setFont('Body',7);c.setFillColor(colors.HexColor('#556878'));c.drawString(42,26,f'Pop Art artist-agent orientation | {d.page}');c.drawRightString(553,26,'v1 | Scoped authority; conversational critique')
for source in sorted(o.glob('[0-9][0-9]_*.md')):
 story=[]
 for block in source.read_text().split('\n\n'):
  style='BodyCustom'
  if block.startswith('# '): style='TitleCustom';block=block[2:].replace('_',' ')
  elif block.startswith('## '):style='SectionCustom';block=block[3:]
  clean=escape(block).replace('**','').replace('`','').replace('\n','<br/>')
  story.append(Paragraph(clean,s[style]))
 SimpleDocTemplate(str(source.with_suffix('.pdf')),pagesize=(595.28,841.89),rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=45,title=source.stem,author='Pop Art Art-Direction System').build(story,onFirstPage=footer,onLaterPages=footer)
