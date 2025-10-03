from parser import parse_text_to_rows

def test_basic_merge():
    raw = """
    Foo Clinic +31 20 123 4567 foo@bar.com https://foo.com
    Foo Clinic +31 20 123 4567 admin@bar.com https://foo.com/contact
    """
    df = parse_text_to_rows(raw)
    row = df[df["Nombre"]=="Foo Clinic"].iloc[0]
    assert "foo@bar.com" in row["Correos"]
    assert "admin@bar.com" in row["Correos"]
