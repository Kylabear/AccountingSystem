UPDATE incoming_dvs 
SET status = 'for_norsa_in', 
    norsa_origin = 'box_c',
    updated_at = NOW()
WHERE id = 8;
