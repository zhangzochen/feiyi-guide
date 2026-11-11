package com.feiyi.exhibit;

import com.feiyi.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExhibitController {
    private final ExhibitRepository exhibitRepository;

    @GetMapping("/exhibits")
    public ApiResponse<List<Exhibit>> list(@RequestParam(required = false) String category) {
        if (category == null || category.isBlank() || "全部".equals(category)) {
            return ApiResponse.ok(exhibitRepository.findAllByOrderBySortAscIdAsc());
        }
        return ApiResponse.ok(exhibitRepository.findByCategoryOrderBySortAscIdAsc(category));
    }

    @GetMapping("/exhibits/{id}")
    public ApiResponse<Exhibit> detail(@PathVariable Long id) {
        return ApiResponse.ok(exhibitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("展品不存在")));
    }

    @GetMapping("/categories")
    public ApiResponse<List<String>> categories() {
        List<String> list = exhibitRepository.findAllByOrderBySortAscIdAsc().stream()
                .map(Exhibit::getCategory).distinct().toList();
        return ApiResponse.ok(list);
    }
}
