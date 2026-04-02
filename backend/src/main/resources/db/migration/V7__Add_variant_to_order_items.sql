-- Add variant reference to order items to support stock reconciliation and order cancellation.
ALTER TABLE order_items
  ADD COLUMN pro_variant_id VARCHAR(36);

ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (pro_variant_id) REFERENCES product_variants(pro_variant_id);
