package com.feiyi.exhibit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExhibitRepository extends JpaRepository<Exhibit, Long> {
    List<Exhibit> findAllByOrderBySortAscIdAsc();
    List<Exhibit> findByCategoryOrderBySortAscIdAsc(String category);
}
