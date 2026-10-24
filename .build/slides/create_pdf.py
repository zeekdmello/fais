from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from pypdf import PdfReader
root=Path('/Users/amit/Desktop/FSD')
images=sorted((root/'.build/slides/rendered').glob('slide-*.png'))
assert len(images)==16
out=root/'docs/presentation'
c=canvas.Canvas(str(out/'Fais-Presentation.pdf'),pagesize=(960,540))
c.setTitle('Fais - A Priority-Based To-Do and Routine Planner')
for image in images:
    c.drawImage(str(image),0,0,width=960,height=540)
    c.showPage()
c.save()
w,h=landscape(A4)
c=canvas.Canvas(str(out/'Fais-Handout-4-per-page.pdf'),pagesize=(w,h))
c.setTitle('Fais - Four slides per page handout')
margin=24;gap=16;cw=(w-2*margin-gap)/2;ch=(h-2*margin-gap)/2
for page in range(4):
    for cell in range(4):
        col=cell%2;row=cell//2
        x=margin+col*(cw+gap);y=h-margin-(row+1)*ch-row*gap
        ih=cw*9/16;iy=y+(ch-ih)/2+6
        c.drawImage(str(images[page*4+cell]),x,iy,width=cw,height=ih)
        c.setStrokeColorRGB(.82,.84,.78);c.setLineWidth(.5);c.rect(x,iy,cw,ih)
        c.setFont('Helvetica',8);c.setFillColorRGB(.4,.45,.35);c.drawString(x,iy-12,f'Slide {page*4+cell+1}')
    c.showPage()
c.save()
for name,count in [('Fais-Presentation.pdf',16),('Fais-Handout-4-per-page.pdf',4)]:
    pdf=PdfReader(out/name)
    assert len(pdf.pages)==count
    print(f'{name}: {len(pdf.pages)} pages, {float(pdf.pages[0].mediabox.width):.2f} x {float(pdf.pages[0].mediabox.height):.2f} pt')
