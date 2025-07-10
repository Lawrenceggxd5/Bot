-- Adiciona campos de email, celular e nickname na tabela carrinhos
ALTER TABLE carrinhos ADD COLUMN email TEXT;
ALTER TABLE carrinhos ADD COLUMN celular TEXT;
ALTER TABLE carrinhos ADD COLUMN nickname TEXT;
